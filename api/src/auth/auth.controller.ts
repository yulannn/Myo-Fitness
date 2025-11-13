import { Controller, Post, Body, Get, UseGuards, Request, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthResultDto } from './dto/auth-result.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(AuthGuard('local'))
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('login')
  @ApiOperation({ summary: 'Se connecter avec e-mail et mot de passe' })
  @ApiBody({ type: SignInDto, description: 'Informations de connexion' })
  @ApiResponse({ status: 200, description: 'Connexion réussie', type: AuthResultDto })
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

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('register')
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiBody({ type: SignUpDto, description: 'Informations pour l’inscription' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès', type: AuthResultDto })
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
  @ApiOperation({ summary: 'Récupérer les informations de l’utilisateur connecté' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Informations utilisateur', type: AuthResultDto })
  getUserInfo(@Request() req) {
    return { user: req.user };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('refresh')
  @ApiOperation({ summary: 'Rafraîchir le token d’accès' })
  @ApiResponse({
    status: 200,
    description: 'Nouveau token généré',
    schema: {
      example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  })
  async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshToken(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    return { accessToken };
  }

  @UseGuards(AuthGuard('jwt'))
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('logout')
  @ApiOperation({ summary: 'Se déconnecter et supprimer le refresh token' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Déconnexion réussie',
    schema: { example: { message: 'Logged out successfully' } },
  })
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.sub);
    res.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }
}
