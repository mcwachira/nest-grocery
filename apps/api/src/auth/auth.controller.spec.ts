import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// A controller test does NOT re-verify AuthService's own logic (that's
// what auth.service.spec.ts is for) — it only checks that the controller
// wires HTTP concerns (the cookie, the response body shape, guard
// behavior) around whatever AuthService returns. Mocking AuthService
// entirely, rather than providing the real one, is what keeps that
// boundary clean: this file can't accidentally start asserting on
// database behavior.
function createAuthServiceMock() {
  return {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    findProfile: jest.fn(),
  };
}

// A minimal fake Express Response — just enough of the surface
// AuthController actually calls (res.cookie / res.clearCookie), captured
// so assertions can inspect what was set. Building a fake by hand like
// this, instead of pulling in a real Express app, is what keeps a
// controller unit test fast; supertest + a real app is the right tool
// once you're testing routing/guards/middleware together (that's an
// integration test, a different layer — see the testing guide).
function createResponseMock() {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;
}

describe('AuthController', () => {
  let controller: AuthController;
  let authService: ReturnType<typeof createAuthServiceMock>;

  beforeEach(async () => {
    authService = createAuthServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('sets the refresh cookie and returns { accessToken, user } without the raw refresh token', async () => {
      authService.register.mockResolvedValueOnce({
        accessToken: 'access-token',
        rawRefreshToken: 'raw-refresh-token',
        user: {
          id: 'user-1',
          email: 'a@b.com',
          firstName: 'A',
          lastName: 'B',
          role: 'CUSTOMER',
        },
      });
      const res = createResponseMock();

      const result = await controller.register(
        {
          email: 'a@b.com',
          password: 'Password1!',
          firstName: 'A',
          lastName: 'B',
        },
        res,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'raw-refresh-token',
        expect.objectContaining({ httpOnly: true }),
      );
      // The raw refresh token must NEVER appear in the JSON body — it's a
      // cookie-only value. This assertion is the regression test for
      // exactly that leak.
      expect(result).toEqual({
        accessToken: 'access-token',
        user: {
          id: 'user-1',
          email: 'a@b.com',
          firstName: 'A',
          lastName: 'B',
          role: 'CUSTOMER',
        },
      });
      expect(result).not.toHaveProperty('rawRefreshToken');
    });
  });

  describe('refresh', () => {
    it('throws UnauthorizedException when the refresh cookie is missing', async () => {
      const req = { cookies: {} } as any;
      const res = createResponseMock();

      await expect(controller.refresh(req, res)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.refresh).not.toHaveBeenCalled();
    });

    it('reads the cookie, calls AuthService.refresh with the raw token, and sets the new cookie', async () => {
      const req = { cookies: { refresh_token: 'old-raw-token' } } as any;
      const res = createResponseMock();
      authService.refresh.mockResolvedValueOnce({
        accessToken: 'new-access-token',
        rawRefreshToken: 'new-raw-token',
      });

      const result = await controller.refresh(req, res);

      expect(authService.refresh).toHaveBeenCalledWith('old-raw-token');
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'new-raw-token',
        expect.any(Object),
      );
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });
  });

  describe('logout', () => {
    it('clears the cookie even when there was no refresh cookie to begin with', async () => {
      const req = { cookies: {} } as any;
      const res = createResponseMock();

      await controller.logout(req, res);

      expect(authService.logout).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.any(Object),
      );
    });
  });

  describe('me', () => {
    it('delegates to AuthService.findProfile with the id from the guarded request', async () => {
      authService.findProfile.mockResolvedValueOnce({
        id: 'user-1',
        email: 'a@b.com',
      });
      const req = { user: { userId: 'user-1', role: 'CUSTOMER' } } as any;

      const result = await controller.me(req);

      expect(authService.findProfile).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ id: 'user-1', email: 'a@b.com' });
    });
  });
});
