import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

interface JwtPayloadWithVersion {
  sub: number;
  email: string;
  name: string;
  profilePictureUrl: string | null;
  tokenVersion: number;
  role: 'USER' | 'COACH';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(payload: JwtPayloadWithVersion) {
    // Vérifier que le tokenVersion correspond à celui en BDD
    const user = await this.usersService.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    // Si le tokenVersion a changé, le token a été révoqué
    if (payload.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException('Session révoquée - veuillez vous reconnecter');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      profilePictureUrl: payload.profilePictureUrl,
      role: payload.role || 'USER',
    };
  }
}
