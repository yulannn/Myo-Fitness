import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthResultDto } from './dto/auth-result.dto';
import { UserEntity } from 'src/users/entities/users.entity';
import { EmailService } from 'src/email/email.service';

type SafeUser = Omit<UserEntity, 'password' | 'refreshToken'>;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  /** Valide l'utilisateur pour le LocalStrategy */
  async validateUser(email: string, password: string): Promise<SafeUser | null> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    const { password: _, refreshToken, ...safeUser } = user;
    return safeUser;
  }

  /** Prépare le payload JWT */
  private buildJwtPayload(user: SafeUser) {
    return {
      sub: user.id,
      email: user.email,
      name: user.name,
      profilePictureUrl: user.profilePictureUrl || null,
    };
  }

  async getFreshUser(id: number) {
    const user = await this.usersService.findUserById(id);

    const { password, refreshToken, ...safeUser } = user;

    return safeUser;
  }

  /** Connexion */
  async signIn(user: SafeUser): Promise<AuthResultDto> {
    const payload = this.buildJwtPayload(user);

    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateUser(user.id, { refreshToken: hashedRefreshToken });

    return { accessToken, refreshToken, user };
  }


  /** Inscription */
  async register(signUpDto: SignUpDto): Promise<AuthResultDto> {
    const existingUser = await this.usersService.findUserByEmail(signUpDto.email);
    if (existingUser) throw new UnauthorizedException('Email already in use');

    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
    const newUser = await this.usersService.createUser({ ...signUpDto, password: hashedPassword });

    const { password, refreshToken, ...safeUser } = newUser;

    const payload = this.buildJwtPayload(safeUser);

    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refreshTokenToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

    const hashedRefreshToken = await bcrypt.hash(refreshTokenToken, 10);
    await this.usersService.updateUser(safeUser.id, { refreshToken: hashedRefreshToken });

    return { accessToken, refreshToken: refreshTokenToken, user: safeUser };
  }

  /** Déconnexion */
  async logout(userId: number) {
    await this.usersService.updateUser(userId, { refreshToken: null });
  }

  /** Rafraîchir le token */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.usersService.findUserById(payload.sub);

      if (!user || !user.refreshToken) throw new UnauthorizedException('Invalid token');

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) throw new UnauthorizedException('Invalid token');

      const safeUser: SafeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePictureUrl: user.profilePictureUrl ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      const newPayload = this.buildJwtPayload(safeUser);

      const newAccessToken = await this.jwtService.signAsync(newPayload, { expiresIn: '15m' });
      const newRefreshToken = await this.jwtService.signAsync(newPayload, { expiresIn: '7d' });

      const hashedNewRefresh = await bcrypt.hash(newRefreshToken, 10);
      await this.usersService.updateUser(user.id, { refreshToken: hashedNewRefresh });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Génère un code de réinitialisation et l'envoie par email
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findUserByEmail(email);

    // Ne pas révéler si l'email existe ou non (sécurité)
    if (!user) {
      return { message: 'Si cet email existe, un code de réinitialisation a été envoyé.' };
    }

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Le code expire dans 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Sauvegarder le code et son expiration
    await this.usersService.updateUser(user.id, {
      resetPasswordCode: code,
      resetPasswordExpires: expiresAt,
    });

    // Envoyer l'email
    await this.emailService.sendPasswordResetEmail(user.email, code, user.name);

    return { message: 'Si cet email existe, un code de réinitialisation a été envoyé.' };
  }

  /**
   * Vérifie uniquement si le code est valide (sans changer le mot de passe)
   */
  async verifyResetCode(email: string, code: string): Promise<{ valid: boolean }> {
    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    // Vérifier si le code existe et n'est pas expiré
    if (!user.resetPasswordCode || !user.resetPasswordExpires) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    // Vérifier si le code a expiré
    if (new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    // Vérifier que le code correspond
    if (user.resetPasswordCode !== code) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    return { valid: true };
  }

  /**
   * Vérifie le code et réinitialise le mot de passe
   */
  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    // Vérifier si le code existe et n'est pas expiré
    if (!user.resetPasswordCode || !user.resetPasswordExpires) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    // Vérifier si le code a expiré
    if (new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    // Vérifier que le code correspond
    if (user.resetPasswordCode !== code) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe et supprimer le code de reset
    await this.usersService.updateUser(user.id, {
      password: hashedPassword,
      resetPasswordCode: null,
      resetPasswordExpires: null,
    });

    return { message: 'Votre mot de passe a été réinitialisé avec succès.' };
  }
}
