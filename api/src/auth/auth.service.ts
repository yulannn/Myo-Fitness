import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthResultDto } from './dto/auth-result.dto';
import { UserEntity } from 'src/users/entities/users.entity';
import { EmailService } from 'src/email/email.service';

type SafeUser = Omit<UserEntity, 'password' | 'refreshToken'>;

// Type pour le payload JWT avec tokenVersion
interface JwtPayloadWithVersion {
  sub: number;
  email: string;
  name: string;
  profilePictureUrl: string | null;
  tokenVersion: number;
}

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

    // Vérifier si l'email est vérifié
    if (!user.emailVerified) {
      throw new UnauthorizedException('Veuillez vérifier votre email avant de vous connecter. Consultez votre boîte de réception.');
    }

    const { password: _, refreshToken, ...safeUser } = user;
    return safeUser;
  }

  /** Prépare le payload JWT avec tokenVersion pour la révocation */
  private buildJwtPayload(user: SafeUser): JwtPayloadWithVersion {
    return {
      sub: user.id,
      email: user.email,
      name: user.name,
      profilePictureUrl: user.profilePictureUrl || null,
      tokenVersion: user.tokenVersion,
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
  async register(signUpDto: SignUpDto): Promise<{ message: string; email: string }> {
    const existingUser = await this.usersService.findUserByEmail(signUpDto.email);
    if (existingUser) throw new BadRequestException('Cet email est déjà utilisé. Si c\'est votre compte, veuillez vous connecter.');

    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
    const newUser = await this.usersService.createUser({
      ...signUpDto,
      password: hashedPassword,
    });

    // Générer un code de vérification à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Le code expire dans 24 heures
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Sauvegarder le code de vérification
    await this.usersService.updateUser(newUser.id, {
      emailVerificationCode: code,
      emailVerificationExpires: expiresAt,
    });

    // Envoyer l'email de vérification
    await this.emailService.sendEmailVerification(newUser.email, code, newUser.name);

    return {
      message: 'Compte créé avec succès. Consultez votre email pour le code de vérification.',
      email: newUser.email,
    };
  }

  /** Déconnexion - Invalide TOUS les tokens en incrémentant la version */
  async logout(userId: number) {
    const user = await this.usersService.findUserById(userId);
    await this.usersService.updateUser(userId, {
      refreshToken: null,
      tokenVersion: user.tokenVersion + 1, // ✅ Révocation de tous les tokens existants
    });
  }

  /** Rafraîchir le token avec vérification de la version */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayloadWithVersion>(refreshToken);
      const user = await this.usersService.findUserById(payload.sub);

      if (!user || !user.refreshToken) throw new UnauthorizedException('Invalid token');

      // ✅ VÉRIFIER LA VERSION DU TOKEN (révocation)
      if (payload.tokenVersion !== user.tokenVersion) {
        throw new UnauthorizedException('Token révoqué - reconnectez-vous');
      }

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) throw new UnauthorizedException('Invalid token');

      const safeUser: SafeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePictureUrl: user.profilePictureUrl ?? null,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        level: user.level,
        xp: user.xp,
        tokenVersion: user.tokenVersion, // ✅ Inclure tokenVersion
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

    // Mettre à jour le mot de passe, supprimer le code de reset ET incrémenter tokenVersion
    await this.usersService.updateUser(user.id, {
      password: hashedPassword,
      resetPasswordCode: null,
      resetPasswordExpires: null,
      tokenVersion: user.tokenVersion + 1, // ✅ Sécurité : déconnecter tous les appareils
    });

    // Envoyer un email de confirmation
    await this.emailService.sendPasswordChangedEmail(user.email, user.name);

    return { message: 'Votre mot de passe a été réinitialisé avec succès. Vous devrez vous reconnecter.' };
  }

  /**
   * Change le mot de passe d'un utilisateur après vérification de l'ancien
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    // Vérifier que le mot de passe actuel est correct
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Le mot de passe actuel est incorrect');
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('Le nouveau mot de passe doit être différent de l\'ancien');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe ET incrémenter tokenVersion pour déconnecter tous les appareils
    await this.usersService.updateUser(user.id, {
      password: hashedPassword,
      tokenVersion: user.tokenVersion + 1, // ✅ Sécurité : déconnecter tous les appareils
    });

    // Envoyer un email de confirmation
    await this.emailService.sendPasswordChangedEmail(user.email, user.name);

    return { message: 'Votre mot de passe a été modifié avec succès. Vous devrez vous reconnecter sur tous vos appareils.' };
  }

  /**
   * Vérifie l'email d'un utilisateur avec le code
   */
  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    if (user.emailVerified) {
      return { message: 'Votre email est déjà vérifié. Vous pouvez vous connecter.' };
    }

    if (!user.emailVerificationCode || !user.emailVerificationExpires) {
      throw new BadRequestException('Code de vérification invalide ou expiré');
    }

    // Vérifier si le code a expiré
    if (new Date() > user.emailVerificationExpires) {
      throw new BadRequestException('Le code de vérification a expiré. Demandez un nouveau code.');
    }

    // Vérifier que le code correspond
    if (user.emailVerificationCode !== code) {
      throw new BadRequestException('Code de vérification incorrect');
    }

    // Marquer l'email comme vérifié
    await this.usersService.updateUser(user.id, {
      emailVerified: true,
      emailVerificationCode: null,
      emailVerificationExpires: null,
    });

    return { message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.' };
  }

  /**
   * Renvoie un code de vérification d'email
   */
  async resendEmailVerification(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      // Ne pas révéler si l'email existe ou non
      return { message: 'Si cet email existe et n\'est pas vérifié, un nouveau code a été envoyé.' };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Cet email est déjà vérifié');
    }

    // Générer un nouveau code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Sauvegarder le nouveau code
    await this.usersService.updateUser(user.id, {
      emailVerificationCode: code,
      emailVerificationExpires: expiresAt,
    });

    // Envoyer l'email
    await this.emailService.sendEmailVerification(user.email, code, user.name);

    return { message: 'Un nouveau code de vérification a été envoyé à votre email.' };
  }
}
