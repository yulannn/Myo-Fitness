import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
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

    async validateUser(signInDto: SignInDto): Promise<SafeUser> {
        const user = await this.usersService.findUserByEmail(signInDto.email);

        if (!user) throw new UnauthorizedException('Invalid credentials');

        const passwordValid = await bcrypt.compare(signInDto.password, user.password);
        if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

        const { password, ...safeUser } = user;
        return safeUser as SafeUser;
    }

    async signIn(user: SafeUser): Promise<AuthResultDto> {
        const payload = { sub: user.id, email: user.email };

        const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
        const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.usersService.updateUser(user.id, { refreshToken: hashedRefreshToken });

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

    async register(signUpDto: SignUpDto): Promise<SafeUser> {
        const existingUser = await this.usersService.findUserByEmail(signUpDto.email);
        if (existingUser) throw new UnauthorizedException('Email already in use');

        const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
        const newUser = await this.usersService.createUser({
            ...signUpDto,
            password: hashedPassword,
        });

        const { password, ...safeUser } = newUser;
        return safeUser as SafeUser;
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken);
            const user = await this.usersService.findUserById(payload.sub);

            if (!user || !user.refreshToken) throw new UnauthorizedException('Invalid token');

            const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
            if (!isMatch) throw new UnauthorizedException('Invalid token');

            const newPayload = { sub: user.id, email: user.email };
            const newAccessToken = await this.jwtService.signAsync(newPayload, { expiresIn: '15m' });
            const newRefreshToken = await this.jwtService.signAsync(newPayload, { expiresIn: '7d' });

            const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
            await this.usersService.updateUser(user.id, { refreshToken: hashedRefreshToken });

            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    async logout(userId: number) {
        await this.usersService.updateUser(userId, { refreshToken: null });
    }
}
