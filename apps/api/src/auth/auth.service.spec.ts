import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// A hand-written fake shaped like the slice of PrismaService this
// AuthService actually calls — not the real PrismaService (that would
// need a live Postgres connection, which is what makes a unit test slow
// and flaky). jest.fn() with no implementation returns undefined by
// default; each test below calls .mockResolvedValueOnce(...) to control
// exactly what that call returns for that one test.
function createPrismaMock() {
  return {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    passwordResetToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = createPrismaMock();
    jwt = { sign: jest.fn().mockReturnValue('signed.jwt.token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        {
          provide: ConfigService,
          // .get() covers JWT_EXPIRES_IN (optional, has a fallback);
          // real code never calls .getOrThrow() from inside AuthService
          // itself, only from JwtStrategy/AuthModule, so a plain .get()
          // stub is enough here.
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // Every test below follows the same three-part shape: Arrange (set up
  // the mocks' return values), Act (call the method under test), Assert
  // (check the result and/or what the mocks were called with). Once you
  // can see that shape, most service-level tests in this codebase follow
  // the same recipe.

  describe('register', () => {
    it('creates a user and returns an access token + safe user object', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValueOnce(null); // no existing user with this email
      prisma.user.create.mockResolvedValueOnce({
        id: 'user-1',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'CUSTOMER',
      });
      prisma.refreshToken.create.mockResolvedValueOnce({});

      // Act
      const result = await service.register({
        email: 'New@Example.com', // mixed case on purpose — see the lowercasing assertion below
        password: 'Password1!',
        firstName: 'New',
        lastName: 'User',
      });

      // Assert
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.rawRefreshToken).toEqual(expect.any(String));
      expect(result.user).toEqual({
        id: 'user-1',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'CUSTOMER',
      });
      // The uniqueness check and the created row must both use the
      // lowercased email — this is the exact bug 00-database-design.md's
      // "Conventions" section warns about (Postgres unique indexes are
      // case-sensitive), so it's worth a real assertion, not just trusting
      // the code once and never re-checking it.
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'new@example.com' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: 'new@example.com' }),
      });
    });

    it('throws ConflictException when the email is already registered', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-user' });

      await expect(
        service.register({
          email: 'taken@example.com',
          password: 'Password1!',
          firstName: 'A',
          lastName: 'B',
        }),
      ).rejects.toThrow(ConflictException);

      // A duplicate email must never reach prisma.user.create — asserting
      // this catches a bug where the conflict check "throws" but a caller
      // (or a future refactor) accidentally lets execution continue.
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns a token pair for correct credentials', async () => {
      const passwordHash = await bcrypt.hash('Password1!', 4); // low cost factor — this is a test, not production hashing
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'A',
        lastName: 'B',
        role: 'CUSTOMER',
        passwordHash,
      });
      prisma.refreshToken.create.mockResolvedValueOnce({});

      const result = await service.login({
        email: 'user@example.com',
        password: 'Password1!',
      });

      expect(result.accessToken).toBe('signed.jwt.token');
    });

    // This is the single most important test in this file. login() must
    // give a would-be attacker ZERO signal about whether an email exists
    // in the system — see the comment in auth.service.ts above the
    // "Invalid Credentials" throw. A regression here (e.g. someone
    // "helpfully" changes one message to be more specific) is exactly the
    // kind of bug that's invisible in manual testing but is a real
    // information-disclosure vulnerability.
    it('throws the exact same error for "no such user" and "wrong password"', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      let noSuchUserError: Error | undefined;
      try {
        await service.login({
          email: 'ghost@example.com',
          password: 'whatever1!',
        });
      } catch (e) {
        noSuchUserError = e as Error;
      }

      const passwordHash = await bcrypt.hash('CorrectPassword1!', 4);
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'real@example.com',
        passwordHash,
      });
      let wrongPasswordError: Error | undefined;
      try {
        await service.login({
          email: 'real@example.com',
          password: 'WrongPassword1!',
        });
      } catch (e) {
        wrongPasswordError = e as Error;
      }

      expect(noSuchUserError).toBeInstanceOf(UnauthorizedException);
      expect(wrongPasswordError).toBeInstanceOf(UnauthorizedException);
      expect(noSuchUserError?.message.toLowerCase()).toBe(
        wrongPasswordError?.message.toLowerCase(),
      );
    });
  });

  describe('refresh', () => {
    it('throws UnauthorizedException when no token is stored', async () => {
      prisma.refreshToken.findUnique.mockResolvedValueOnce(null);

      await expect(service.refresh('unknown-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for an expired token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'rt-1',
        userId: 'user-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000), // already expired
        user: { id: 'user-1', role: 'CUSTOMER' },
      });

      await expect(service.refresh('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('revokes every live token for the user when a REVOKED token is replayed', async () => {
      // This is the reuse-detection path: presenting an already-revoked
      // refresh token is a strong signal of theft, so the service should
      // revoke every other live token for that user, not just reject this
      // one request.
      prisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'rt-1',
        userId: 'user-1',
        revokedAt: new Date(), // already revoked = replay
        expiresAt: new Date(Date.now() + 100000),
        user: { id: 'user-1', role: 'CUSTOMER' },
      });

      await expect(service.refresh('stolen-token')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('rotates the token and returns a new pair on success', async () => {
      prisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'rt-1',
        userId: 'user-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 100000),
        user: {
          id: 'user-1',
          role: 'CUSTOMER',
          email: 'a@b.com',
          firstName: 'A',
          lastName: 'B',
        },
      });
      prisma.refreshToken.update.mockResolvedValueOnce({});
      prisma.refreshToken.create.mockResolvedValueOnce({});

      const result = await service.refresh('valid-token');

      expect(result.accessToken).toBe('signed.jwt.token');
      // The OLD token row must be revoked, not deleted — see
      // 00-database-design.md: revoking (not deleting) keeps an audit
      // trail of token reuse attempts.
      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'rt-1' },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('logout', () => {
    it('revokes the matching live token and never throws, even for an unknown token', async () => {
      prisma.refreshToken.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(service.logout('unknown-token')).resolves.toBeUndefined();
    });
  });
});
