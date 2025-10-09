import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.authenticate(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getUserInfo(@Request() request) {
    return { user: request.user };
  }
}
