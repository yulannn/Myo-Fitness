import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserEntity } from './entities/users.entity';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/users')
export class UsersController {
  constructor(private usersService: UsersService) {}


  @Get('email/:email')
  @ApiOperation({ summary: 'Récupérer un utilisateur par email' })
  @ApiParam({
    name: 'email',
    description: 'Email de l’utilisateur',
    example: 'jean.dupont@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur trouvé',
    type: UserEntity,
  })
  async getUserByEmail(@Param('email') email: string) {
    return this.usersService.findUserByEmail(email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par ID' })
  @ApiParam({ name: 'id', description: 'ID de l’utilisateur', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur trouvé',
    type: UserEntity,
  })
  async getUserById(@Param('id') id: number) {
    return this.usersService.findUserById(id);
  }
}
