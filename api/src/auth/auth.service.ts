import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthResultDto } from './dto/auth-result.dto';
import { UserEntity } from 'src/users/entities/users.entity';

type SafeUser = Omit<UserEntity, 'password'>;

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async authenticate(input: SignInDto): Promise<AuthResultDto> {
        const user = await this.validateUser(input);
        return this.signIn(user);
    }

    async validateUser(signInDto: SignInDto): Promise<SafeUser> {
        const user = await this.usersService.findUserByEmail(signInDto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordValid = await bcrypt.compare(signInDto.password, user.password);
        if (!passwordValid) {
            throw new UnauthorizedException('Invalid credentials password');
        }

        const { password, ...safeUser } = user;
        return safeUser as SafeUser;
    }


    private async signIn(user: SafeUser): Promise<AuthResultDto> {
        const payload = { sub: user.id, email: user.email };

        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: '15m',
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '7d',
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }


}
