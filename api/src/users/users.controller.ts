import { Controller, Get, Post, Param, UseGuards, UseInterceptors, Req, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/users')
export class UsersController {
  constructor(private usersService: UsersService) { }


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

  @Post('me/profile-picture')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: './uploads/profile-pictures',
        filename: (req, file, cb) => {
          const userId = (req.user as any).id;
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${userId}-${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Seules les images sont autorisées !'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const userId = req.user.userId;
    const profilePictureUrl = `/uploads/profile-pictures/${file.filename}`;

    await this.usersService.updateUser(userId, {
      profilePictureUrl,
    });

    return { profilePictureUrl };
  }
}
