# Backend 02 — Auth API (step-by-step implementation)

Prerequisite: `01-prisma-setup.md` done (`User`, `RefreshToken`,
`PasswordResetToken` tables exist, `PrismaService` is wired). High-level
design/decisions already made in `docs/01-auth.md` — this doc is the
concrete build.

## What you're building

`POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`,
`POST /auth/logout`, `POST /auth/forgot-password`,
`POST /auth/reset-password`, `GET /auth/me`, plus the `JwtAuthGuard` and
`RolesGuard` every other feature guide depends on.

## Step 1 — global setup in `main.ts` (do this first, unlocks everything else)

```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Strips unknown properties from incoming request bodies (whitelist)
  // and REJECTS the request if an unknown property is present
  // (forbidNonWhitelisted) rather than silently dropping it — the second
  // half matters: silently dropping a typo'd field is a bug that looks
  // like it worked. transform:true lets Nest auto-convert query/param
  // strings into the types your DTOs declare (e.g. "5" -> 5).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Needed to read the httpOnly refresh_token cookie in AuthController.
  app.use(cookieParser());

  // credentials:true is required for the browser to send/receive cookies
  // cross-origin. In LOCAL dev, docker/nginx/local.conf path-routes
  // everything through one origin so this never gets exercised — in
  // PRODUCTION, docker/nginx/prod.conf routes by subdomain
  // (storefront.example.com calling api.example.com), which is genuinely
  // cross-origin. Configure this for real now so prod doesn't surprise
  // you later — see docs/01-auth.md's pitfalls section.
  app.enableCors({
    origin: [process.env.STOREFRONT_ORIGIN, process.env.ADMIN_ORIGIN].filter(Boolean),
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
```

```bash
pnpm add cookie-parser
pnpm add -D @types/cookie-parser
```

Add `STOREFRONT_ORIGIN` / `ADMIN_ORIGIN` to `.env.example` and your local
`.env` (e.g. `http://localhost` for both in dev, since `local.conf`
serves everything off one origin — the real distinction matters in prod).

## Step 2 — install auth-specific packages

```bash
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt class-validator class-transformer
pnpm add -D @types/passport-jwt @types/bcrypt
```

```typescript
// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // isGlobal:true means ConfigService is injectable anywhere without
    // re-importing ConfigModule per feature — same reasoning as
    // PrismaModule's @Global() in 01-prisma-setup.md.
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}
```

## Step 3 — DTOs

```typescript
// apps/api/src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  // MinLength(8) is a floor, not real password strength enforcement —
  // fine for v1. If you want more, add a regex @Matches for
  // upper/lower/digit, but don't over-engineer this for a learning
  // project's v1.
  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
```

```typescript
// apps/api/src/auth/dto/login.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

```typescript
// apps/api/src/auth/dto/reset-password.dto.ts
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
```

## Step 4 — `AuthService`

```typescript
// apps/api/src/auth/auth.service.ts
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const BCRYPT_ROUNDS = 12; // see "scalability" section below for why 12, not 10 or 14
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

    return this.issueTokenPair(user.id, user.role);
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Same generic error whether the email doesn't exist OR the password
    // is wrong — never let a client distinguish "no such account" from
    // "wrong password," that's a user-enumeration leak.
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokenPair(user.id, user.role);
  }

  async refresh(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    // Reuse-detection: if this exact token hash exists but is already
    // revoked, someone is replaying an old (likely stolen) refresh token.
    // Real-world response for a production app would be "revoke every
    // token for this user" — noted here, not built, since it's beyond
    // v1 scope; flagging it so you know the gap exists.
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Rotation: revoke the old token, issue a brand new pair. This is
    // what makes refresh tokens revocable at all (a stateless JWT refresh
    // token can't be un-issued; a DB-backed one can).
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokenPair(stored.user.id, stored.user.role);
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

  // --- internals ---

  private async issueTokenPair(userId: string, role: string) {
    const accessToken = this.jwt.sign(
      { sub: userId, role },
      { expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '15m' }, // short-lived on purpose
    );

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    // Return the RAW refresh token to the caller (controller sets it as
    // an httpOnly cookie) — only the HASH is ever persisted, mirroring
    // how passwords are handled. See 00-database-design.md.
    return { accessToken, rawRefreshToken };
  }

  private hashToken(raw: string): string {
    // sha256 is fine here (not bcrypt) — this isn't a low-entropy
    // human password, it's a 40-byte random token; a fast hash is
    // appropriate and lets lookups use a plain unique-index equality
    // query instead of bcrypt.compare against every row.
    return crypto.createHash('sha256').update(raw).digest('hex');
  }
}
```

## Step 5 — `JwtStrategy` + guards

```typescript
// apps/api/src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  // Whatever this returns becomes req.user in every guarded route.
  // Deliberately minimal — sub/role only, not a full DB user object,
  // since re-fetching the user on every single authenticated request
  // is unnecessary; fetch the full user explicitly (GET /auth/me) only
  // when you actually need more than id+role.
  async validate(payload: { sub: string; role: string }) {
    return { userId: payload.sub, role: payload.role };
  }
}
```

```typescript
// apps/api/src/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

```typescript
// apps/api/src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

```typescript
// apps/api/src/auth/guards/roles.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true; // no @Roles() decorator = no restriction

    const { user } = context.switchToHttp().getRequest();
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
```

## Step 6 — controller

```typescript
// apps/api/src/auth/auth.controller.ts
import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const REFRESH_COOKIE = 'refresh_token';
const REFRESH_COOKIE_OPTS = {
  httpOnly: true, // never readable by client JS — mitigates XSS token theft
  secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod; local dev is plain http
  sameSite: 'lax' as const, // fine across *.example.com subdomains — see docs/01-auth.md
  path: '/auth', // scope the cookie to only the routes that need it
};

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, rawRefreshToken } = await this.auth.register(dto);
    res.cookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_COOKIE_OPTS);
    return { accessToken };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, rawRefreshToken } = await this.auth.login(dto);
    res.cookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_COOKIE_OPTS);
    return { accessToken };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (!raw) throw new UnauthorizedException('No refresh token');

    const { accessToken, rawRefreshToken } = await this.auth.refresh(raw);
    res.cookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_COOKIE_OPTS);
    return { accessToken };

    const REFRESH_COOKIE = 'refresh_token';
    const REFRESH_COOKIE_OPTS = {
      httpOnly: true, // never readable by client JS — mitigates XSS token theft
      secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod; local dev is plain http
      sameSite: 'lax' as const, // fine across *.example.com subdomains — see docs/01-auth.md
      path: '/auth', // scope the cookie to only the routes that need it
    };

    @Controller('auth')
    export class AuthController {
      constructor(private readonly authService: AuthService) {}

      @Post()
      async register(
              @Body() dto: RegisterDto,
              @Res({ passthrough: true }) res: Response,
      ) {
        const { accessToken, rawRefreshToken } =
                await this.authService.register(dto);
        res.cookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_COOKIE_OPTS);

        return { accessToken };
      }

      @Post('login')
      @HttpCode(200)
      async login(
              @Body() dto: RegisterDto,
              @Res({ passthrough: true }) res: Response,
      ) {
        const { accessToken, rawRefreshToken } = await this.auth.login(dto);
        res.cookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_COOKIE_OPTS);
        return { accessToken };
      }

      @Post('refresh')
      @HttpCode(200)
      async refresh(
              @Req() dto: Register,
              @Res({ passthrough: true }) res: Response,
      ) {
        const raw = req.cookies?.[REFRESH_COOKIE];
        if (!raw) throw new UnauthorizedException('No Refresh Token');
        const { accessToken, rawRefreshToken } = await this.auth.refresh(dto);
        res.cookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_COOKIE_OPTS);
        return { accessToken };
      }

      @Post('logout')
      @HttpCode(204)
      async logout(import {
      Body,
      Controller,
      Get,
      HttpCode,
      Post,
      Req,
      Res,
      UnauthorizedException,
      UseGuards,
    } from '@nestjs/common';
    import type { Request, Response } from 'express';
    import { AuthService } from './auth.service';
    import { RegisterDto } from './dto/register.dto';
    import { LoginDto } from './dto/login.dto';
    import { JwtAuthGuard } from './guards/jwt-auth.guard';

    const REFRESH_COOKIE = 'refresh_token';
    const REFRESH_COOKIE_OPTS = {
      httpOnly: true, // never readable by client JS — mitigates XSS token theft
      secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod; local dev is plain http
      sameSite: 'lax' as const, // fine across *.example.com subdomains — see docs/01-auth.md
      path: '/auth', // scope the cookie to only the routes that need it
    };

    const REFRESH_COOKIE = 'refresh_token';
    const REFRESH_COOKIE_OPTS = {
      httpOnly: true, // never readable by client JS — mitigates XSS token theft
      secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod; local dev is plain http
      sameSite: 'lax' as const, // fine across *.example.com subdomains — see docs/01-auth.md
      path: '/auth', // scope the cookie to only the routes that need it
    };

    @Controller('auth')
    export class AuthController {
      constructor(private readonly authService: AuthService) {}

      @Post()
      async register(
              @Body() dto: RegisterDto,
              @Res({ passthrough: true }) res: Response,
      ) {
        const { accessToken, rawRefreshToken } =
                await this.authService.register(dto);
        res.cookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_COOKIE_OPTS);

        return { accessToken };
      }

      @Post('login')
      @HttpCode(200)
      async login(
              @Body() dto: RegisterDto,
              @Res({ passthrough: true }) res: Response,
      ) {
        const { accessToken, rawRefreshToken } = await this.auth.login(dto);
        res.cookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_COOKIE_OPTS);
        return { accessToken };
      }

      @Post('refresh')
      @HttpCode(200)
      async refresh(
              @Req() dto: Register,
              @Res({ passthrough: true }) res: Response,
      ) {
        const raw = req.cookies?.[REFRESH_COOKIE];
        if (!raw) throw new UnauthorizedException('No Refresh Token');
        const { accessToken, rawRefreshToken } = await this.auth.refresh(dto);
        res.cookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_COOKIE_OPTS);
        return { accessToken };
      }

      @Post('logout')
      @HttpCode(204)
      async logout(
              @Req() dto: Register,
              @Res({ passthrough: true }) res: Response,
      ) {
        const raw = req.cookies?.[REFRESH_COOKIE];
        if (raw) await this.auth.logout(raw);
        res.clearCookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_COOKIE_OPTS);
      }

      @UseGuards(JwtAuthGuard)
      @Get('me')
      async me(@Req() req: Request & { user: { userId: string; role: string } }) {
        // Full profile lookup happens here, deliberately, not in JwtStrategy —
        // see the comment on JwtStrategy.validate above.
        return this.auth.findProfile(req.user.userId);
      }
    }

  @Req() dto: Register,
              @Res({ passthrough: true }) res: Response,
      ) {
        const raw = req.cookies?.[REFRESH_COOKIE];
        if (raw) await this.auth.logout(raw);
        res.clearCookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_COOKIE_OPTS);
      }

      @UseGuards(JwtAuthGuard)
      @Get('me')
      async me(@Req() req: Request & { user: { userId: string; role: string } }) {
        // Full profile lookup happens here, deliberately, not in JwtStrategy —
        // see the comment on JwtStrategy.validate above.
        return this.auth.findProfile(req.user.userId);
      }
    }

  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (raw) await this.auth.logout(raw);
    res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTS);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request & { user: { userId: string; role: string } }) {
    // Full profile lookup happens here, deliberately, not in JwtStrategy —
    // see the comment on JwtStrategy.validate above.
    return this.auth.findProfile(req.user.userId);
  }
}
```

(Add a `findProfile(userId)` method to `AuthService` — a simple
`prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { passwordHash: false, ... } })`;
omitted above for brevity but exclude `passwordHash` from the select
explicitly, don't rely on remembering to strip it from the response.)

## Step 7 — `AuthModule`

```typescript
// apps/api/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    // registerAsync (not register) so we can read JWT_SECRET from
    // ConfigService instead of hardcoding it — required since
    // ConfigModule.forRoot() finishes loading asynchronously.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') ?? '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // other modules' guards import JwtStrategy indirectly via PassportModule; exporting AuthService lets, e.g., a future admin-invite flow reuse register logic
})
export class AuthModule {}
```

## Testing it (do this before moving on)

```bash
# register
curl -i -c cookies.txt -X POST http://localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# confirm the refresh_token cookie landed (check cookies.txt)
cat cookies.txt

# call a guarded route with the returned accessToken
curl -i http://localhost:4000/auth/me -H "Authorization: Bearer <accessToken>"

# refresh using the cookie jar
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:4000/auth/refresh
```

Then build one throwaway `@UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin')`
route and confirm a customer token gets 403 and an admin token (manually
flip a seeded user's `role` in Prisma Studio) gets 200 — this proves RBAC
before any real admin endpoint exists.

## Pitfalls specific to this exact stack

- **Raw body / cookie parsing must be wired before any route uses them** —
  forgetting `app.use(cookieParser())` makes `req.cookies` `undefined`
  silently (not an error), and every refresh/logout call will look like
  "no refresh token" with no obvious cause. If refresh/logout mysteriously
  always 401s, check this first.
- **`forbidNonWhitelisted: true` will reject a request the moment your
  frontend sends one extra field** (e.g. a stray `confirmPassword` field
  from a form) — this is intentional (catches typos early) but is the
  most common "why is my request getting rejected" surprise once you wire
  up the storefront form in `01-auth.md`'s frontend section. Check the
  400 response body — Nest tells you exactly which property was rejected.
- **Don't skip the reuse-detection comment in `refresh()`** — it's noted
  as a gap, not built. If you're using this project to learn what
  "production-grade" auth looks like, treat that TODO as a real thing to
  come back to once the rest of the app works, not a permanent gap.
- **CORS `origin` must be an explicit array, never `'*'`, once
  `credentials: true` is set** — browsers reject the combination of
  wildcard origin + credentials outright, so you'd hit this immediately
  in testing, not silently in prod. Good — it forces you to configure it
  correctly from the start.

## Scalability notes

- **JWT verification is stateless and horizontally scalable for free** —
  any `api` replica (recall `docker-production.yml` runs `replicas: 2`)
  can verify an access token with zero shared state, since `JwtStrategy`
  only needs `JWT_SECRET`. This is *why* access tokens are JWTs and
  refresh tokens aren't — refresh tokens need to be revocable, which
  requires shared state (the DB), while access tokens deliberately don't.
- **bcrypt cost factor (12 rounds here) is a real CPU trade-off under
  load** — each login/register call blocks the Node event loop for
  bcrypt's hashing time (tens of milliseconds at cost 12). At real login
  volume, this is exactly the kind of work you'd eventually move to a
  worker thread pool or a queue — not needed at this project's scale, but
  worth knowing *why* auth endpoints are often the first thing to need
  that treatment as traffic grows, unlike almost every other endpoint in
  this app.
- **Refresh token lookups hit `refresh_tokens.tokenHash` (unique index)** —
  cheap even at large row counts. If this table grows unbounded (users who
  never explicitly log out just accumulate expired rows), add a periodic
  cleanup job (delete where `expiresAt < now()`) — a cron-like NestJS
  `@Cron()` task once you're comfortable with the basics, not required
  for v1.
- **Login endpoint should eventually be rate-limited** (`@nestjs/throttler`)
  to blunt credential-stuffing — not built here since it's a small,
  bolt-on addition once the core flow works; a good "next thing to learn"
  once this doc's checklist is done.

## Done looks like

Same checklist as `docs/01-auth.md`'s "Done looks like" — this doc is the
implementation of that acceptance bar, verify against it there.
