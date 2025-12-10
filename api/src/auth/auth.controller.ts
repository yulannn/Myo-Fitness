import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Request,
    Res,
    HttpCode,
} from '@nestjs/common';
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
    @Throttle({ default: { limit: 5, ttl: 60000 } })
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
    @ApiBody({ type: SignUpDto, description: 'Informations pour l\'inscription' })
    @ApiResponse({ status: 201, description: 'Utilisateur créé - Email de vérification envoyé' })
    async register(@Body() signUpDto: SignUpDto) {
        return this.authService.register(signUpDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    @ApiOperation({ summary: 'Récupérer les informations de l\'utilisateur connecté' })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Informations utilisateur', type: AuthResultDto })
    async getUserInfo(@Request() req) {
        const user = await this.authService.getFreshUser(req.user.userId);
        return { user };
    }

    @UseGuards(AuthGuard('jwt'))
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('logout')
    @HttpCode(200)
    @ApiOperation({ summary: 'Se déconnecter et supprimer le refresh token' })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Déconnexion réussie', schema: { example: { message: 'Logged out successfully' } } })
    async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(req.user.userId);
        res.clearCookie('refreshToken');
        return { message: 'Logged out successfully' };
    }

    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('refresh')
    @HttpCode(200)
    @ApiOperation({ summary: 'Rafraîchir le token d\'accès' })
    @ApiResponse({
        status: 200,
        description: 'Nouveau token généré',
        schema: {
            example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
    })
    async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refreshToken'];
        const { accessToken, refreshToken: newRefreshToken } =
            await this.authService.refreshToken(refreshToken);

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { accessToken };
    }

    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('forgot-password')
    @HttpCode(200)
    @ApiOperation({ summary: 'Demander un code de réinitialisation de mot de passe' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
            },
            required: ['email'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Code envoyé si l\'email existe',
        schema: {
            example: { message: 'Si cet email existe, un code de réinitialisation a été envoyé.' },
        },
    })
    async requestPasswordReset(@Body('email') email: string) {
        return this.authService.requestPasswordReset(email);
    }

    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('verify-code')
    @HttpCode(200)
    @ApiOperation({ summary: 'Vérifier le code de réinitialisation' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                code: { type: 'string', example: '123456' },
            },
            required: ['email', 'code'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Code valide',
        schema: {
            example: { valid: true },
        },
    })
    async verifyCode(
        @Body('email') email: string,
        @Body('code') code: string,
    ) {
        return this.authService.verifyResetCode(email, code);
    }

    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('reset-password')
    @HttpCode(200)
    @ApiOperation({ summary: 'Réinitialiser le mot de passe avec le code reçu' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                code: { type: 'string', example: '123456' },
                newPassword: { type: 'string', example: 'NouveauMotDePasse123!' },
            },
            required: ['email', 'code', 'newPassword'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Mot de passe réinitialisé',
        schema: {
            example: { message: 'Votre mot de passe a été réinitialisé avec succès.' },
        },
    })
    async resetPassword(
        @Body('email') email: string,
        @Body('code') code: string,
        @Body('newPassword') newPassword: string,
    ) {
        return this.authService.resetPassword(email, code, newPassword);
    }

    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('verify-email')
    @HttpCode(200)
    @ApiOperation({ summary: 'Vérifier l\'email avec le code reçu' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                code: { type: 'string', example: '123456' },
            },
            required: ['email', 'code'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Email vérifié avec succès',
        schema: {
            example: { message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.' },
        },
    })
    async verifyEmail(
        @Body('email') email: string,
        @Body('code') code: string,
    ) {
        return this.authService.verifyEmail(email, code);
    }

    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('resend-verification')
    @HttpCode(200)
    @ApiOperation({ summary: 'Renvoyer le code de vérification d\'email' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
            },
            required: ['email'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Code renvoyé',
        schema: {
            example: { message: 'Un nouveau code de vérification a été envoyé à votre email.' },
        },
    })
    async resendVerification(@Body('email') email: string) {
        return this.authService.resendEmailVerification(email);
    }
}
