import { Controller, Post, Body, Get, UseGuards, Request, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { SignUpDto } from './dto/sign-up.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signIn(req.user);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('register')
  async register(@Body() signUpDto: SignUpDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(signUpDto);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: result.accessToken, user: result.user };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getUserInfo(@Request() req) {
    return { user: req.user };
  }

  @Post('refresh')
  async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    return { accessToken };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.sub);
    res.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }
}
