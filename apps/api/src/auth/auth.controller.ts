import {
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
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, rawRefreshToken, user } =
      await this.authService.register(dto);
    res.cookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_COOKIE_OPTS);

    return { accessToken, user };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, rawRefreshToken, user } =
      await this.authService.login(dto);
    res.cookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_COOKIE_OPTS);
    return { accessToken, user };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (!raw) throw new UnauthorizedException('No Refresh Token');
    const { accessToken, rawRefreshToken } =
      await this.authService.refresh(raw);
    res.cookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_COOKIE_OPTS);
    return { accessToken };
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (raw) await this.authService.logout(raw);
    res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTS);
  }

  @Post('forgot-password')
  @HttpCode(202)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request & { user: { userId: string; role: string } }) {
    // Full profile lookup happens here, deliberately, not in JwtStrategy —
    // see the comment on JwtStrategy.validate above.
    return this.authService.findProfile(req.user.userId);
  }
}
