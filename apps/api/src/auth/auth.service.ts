import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_TTL_DAYS = 30;
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // lowercase before the uniqueness check — Postgres unique indexes are
    // case-sensitive, so "Foo@x.com" and "foo@x.com" would otherwise both
    // succeed as "unique" rows for the same real person. See
    // 00-database-design.md's Conventions.
    const email = dto.email.toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Deliberately vague — "email already registered" is fine here
      // (unlike login, where you don't want to confirm an email exists;
      // registration inherently reveals that already via the 409 itself).

      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    return this.issueTokenPair(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Same generic error whether the email doesn't exist OR the password
    // is wrong — never let a client distinguish "no such account" from
    // "wrong password," that's a user-enumeration leak.

    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) throw new UnauthorizedException('invalid credentials');

    return this.issueTokenPair(user);
  }

  async refresh(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (stored?.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    // Reuse-detection: if this exact token hash exists but is already
    // revoked, someone is replaying an old (likely stolen) refresh token.
    // Real-world response for a production app would be "revoke every
    // token for this user" — noted here, not built, since it's beyond
    // v1 scope; flagging it so you know the gap exists.

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    // Rotation: revoke the old token, issue a brand new pair. This is
    // what makes refresh tokens revocable at all (a stateless JWT refresh
    // token can't be un-issued; a DB-backed one can).
    await this.prisma.refreshToken.update({
      where: {
        id: stored.id,
      },
      data: { revokedAt: new Date() },
    });

    return this.issueTokenPair(stored.user);
  }

  async logout(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);
    // updateMany (not update) because a token that's already invalid/
    // missing shouldn't throw on logout — logging out should always
    // succeed from the client's point of view.
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async findProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });
  }

  async forgotPassword(rawEmail: string) {
    const email = rawEmail.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    //Do the token creation + "send" only if the user exist, byt never

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = this.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 100); //1 hour

      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });
      // local testing — this line must not survive to production.
      console.log(
        `[dev-only] password reset link: /reset-password?token=${rawToken}`,
      );
    }
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or Expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: stored.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
      // Also revoke every existing refresh token for this user — a
      // password reset should kill all existing sessions, not just
      // change the password under them.
      this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }
  //internals

  private async issueTokenPair(user: {
    id: string;
    role: Role;
    email: string;
    firstName: string;
    lastName: string;
  }) {
    const accessToken = this.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '15m' },
    );

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    // Return the RAW refresh token to the caller (controller sets it as
    // an httpOnly cookie) — only the HASH is ever persisted, mirroring
    // how passwords are handled. See 00-database-design.md.
    return {
      accessToken,
      rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  private hashToken(raw: string): string {
    // sha256 is fine here (not bcrypt) — this isn't a low-entropy
    // human password, it's a 40-byte random token; a fast hash is
    // appropriate and lets lookups use a plain unique-index equality
    // query instead of bcrypt.compare against every row.
    return crypto.createHash('sha256').update(raw).digest('hex');
  }
}
