import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }


  async authenticate(input: CreateAuthDto): Promise<any> {
    const user = await this.validateUser(input);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      access_token: 'fake-jwt-token',
      userId: user.userId,
      name: user.name
    }
  }

  async validateUser(createAuthDto: CreateAuthDto) {
    const user = await this.usersService.findUserByEmail(createAuthDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.password !== createAuthDto.password) {
      throw new UnauthorizedException('Invalid password');
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  }
}