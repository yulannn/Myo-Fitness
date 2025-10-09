import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  async getUserByEmail(email: string) {
    return this.usersService.findUserByEmail(email);
  }

  async getUserById(id: number) {
    return this.usersService.findUserById(id);
  }
}
