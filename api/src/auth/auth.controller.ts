import { Controller, Post, Body, Get, UseGuards, Request, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthResultDto } from './dto/auth-result.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Se connecter avec e-mail et mot de passe' })
  @ApiBody({ type: SignInDto, description: 'Informations de connexion' })
  @ApiResponse({ status: 200, description: 'Connexion réussie', type: AuthResultDto })
  login(@Request() req, @Res({ passthrough: true }) res: Response) {
    return this.authService.signIn(req.user).then(result => {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });

      return { accessToken: result.accessToken, user: result.user };
    });
  }

  @Post('register')
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiBody({ type: SignUpDto, description: 'Informations pour l’inscription' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès', type: AuthResultDto })
  register(@Body() signUpDto: SignUpDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.register(signUpDto).then(result => {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { accessToken: result.accessToken, user: result.user };
    });
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiOperation({ summary: 'Récupérer les informations de l’utilisateur connecté' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Informations utilisateur', type: AuthResultDto })
  getUserInfo(@Request() req) {
    return { user: req.user };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rafraîchir le token d’accès' })
  @ApiResponse({
    status: 200,
    description: 'Nouveau token généré',
    schema: {
      example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  })
  refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    return this.authService.refreshToken(refreshToken).then(({ accessToken, refreshToken: newRefreshToken }) => {
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });

      return { accessToken };
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @ApiOperation({ summary: 'Se déconnecter et supprimer le refresh token' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Déconnexion réussie',
    schema: { example: { message: 'Logged out successfully' } },
  })
  logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req.user.sub).then(() => {
      res.clearCookie('refreshToken');
      return { message: 'Logged out successfully' };
    });
  }
}
