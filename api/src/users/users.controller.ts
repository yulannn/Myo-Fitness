import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, Delete, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UserEntity } from './entities/users.entity';
import { AuthGuard } from '@nestjs/passport';
import { R2Service } from '../r2/r2.service';
import { AuthService } from '../auth/auth.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private r2Service: R2Service,
    private authService: AuthService,
  ) { }


  @Get('email/:email')
  @ApiOperation({ summary: 'Récupérer un utilisateur par email' })
  @ApiParam({
    name: 'email',
    description: 'Email de l\'utilisateur',
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
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur trouvé',
    type: UserEntity,
  })
  async getUserById(@Param('id') id: number) {
    return this.usersService.findUserById(id);
  }

  @Post('me/profile-picture/presigned-url')
  @ApiOperation({ summary: 'Générer une URL présignée pour uploader une photo de profil' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileExtension: {
          type: 'string',
          description: 'Extension du fichier (ex: .jpg, .png)',
          example: '.jpg',
        },
        contentType: {
          type: 'string',
          description: 'Type MIME du fichier',
          example: 'image/jpeg',
        },
      },
      required: ['fileExtension', 'contentType'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'URL présignée générée avec succès',
    schema: {
      type: 'object',
      properties: {
        uploadUrl: { type: 'string', description: 'URL présignée pour upload' },
        key: { type: 'string', description: 'Clé du fichier dans R2' },
        publicUrl: { type: 'string', description: 'URL publique du fichier une fois uploadé' },
      },
    },
  })
  async generateProfilePictureUploadUrl(
    @Body() body: { fileExtension: string; contentType: string },
    @Req() req,
  ) {
    const userId = req.user.userId;
    const { fileExtension, contentType } = body;

    // Valider le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(contentType)) {
      throw new BadRequestException('Seules les images sont autorisées (JPEG, PNG, GIF)');
    }

    // Valider l'extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
      throw new BadRequestException('Extension de fichier invalide');
    }

    // Générer la clé du fichier
    const key = this.r2Service.generateProfilePictureKey(userId, fileExtension);

    // Générer l'URL présignée (valide pendant 5 minutes)
    const presignedData = await this.r2Service.generatePresignedUploadUrl(
      key,
      contentType,
      300, // 5 minutes
    );

    return presignedData;
  }

  @Post('me/profile-picture/confirm')
  @ApiOperation({ summary: 'Confirmer l\'upload et sauvegarder l\'URL de la photo de profil' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        publicUrl: {
          type: 'string',
          description: 'URL publique de la photo de profil uploadée',
          example: 'https://bucket.accountid.r2.cloudflarestorage.com/profile-pictures/user-123.jpg',
        },
      },
      required: ['publicUrl'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Photo de profil mise à jour avec succès',
    schema: {
      type: 'object',
      properties: {
        profilePictureUrl: { type: 'string' },
      },
    },
  })
  async confirmProfilePictureUpload(
    @Body() body: { publicUrl: string },
    @Req() req,
  ) {
    const userId = req.user.userId;
    const { publicUrl } = body;

    // Récupérer l'utilisateur actuel pour supprimer l'ancienne photo si elle existe
    const user = await this.usersService.findUserById(userId);

    // Si l'utilisateur avait déjà une photo de profil, la supprimer
    if (user.profilePictureUrl) {
      const oldKey = this.r2Service.extractKeyFromUrl(user.profilePictureUrl);
      if (oldKey) {
        try {
          await this.r2Service.deleteFile(oldKey);
        } catch (error) {
          // Log l'erreur mais ne pas bloquer la mise à jour
          console.error('Erreur lors de la suppression de l\'ancienne photo:', error);
        }
      }
    }

    // Mettre à jour l'URL de la photo de profil dans la base de données
    await this.usersService.updateUser(userId, {
      profilePictureUrl: publicUrl,
    });

    return { profilePictureUrl: publicUrl };
  }

  @Delete('me/profile-picture')
  @ApiOperation({ summary: 'Supprimer la photo de profil' })
  @ApiResponse({
    status: 200,
    description: 'Photo de profil supprimée avec succès',
  })
  async deleteProfilePicture(@Req() req) {
    const userId = req.user.userId;

    // Récupérer l'utilisateur actuel
    const user = await this.usersService.findUserById(userId);

    // Si l'utilisateur a une photo de profil, la supprimer de R2
    if (user.profilePictureUrl) {
      const key = this.r2Service.extractKeyFromUrl(user.profilePictureUrl);
      if (key) {
        await this.r2Service.deleteFile(key);
      }
    }

    // Mettre à jour l'utilisateur pour retirer l'URL de la photo de profil
    await this.usersService.updateUser(userId, {
      profilePictureUrl: null,
    });

    return { message: 'Photo de profil supprimée avec succès' };
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Modifier le mot de passe de l\'utilisateur connecté' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        currentPassword: {
          type: 'string',
          description: 'Mot de passe actuel',
          example: 'AncienMotDePasse123!',
        },
        newPassword: {
          type: 'string',
          description: 'Nouveau mot de passe',
          example: 'NouveauMotDePasse123!',
        },
      },
      required: ['currentPassword', 'newPassword'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe modifié avec succès',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Mot de passe actuel incorrect',
  })
  @ApiResponse({
    status: 400,
    description: 'Le nouveau mot de passe doit être différent de l\'ancien',
  })
  async changePassword(
    @Body() body: { currentPassword: string; newPassword: string },
    @Req() req,
  ) {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = body;

    return this.authService.changePassword(userId, currentPassword, newPassword);
  }

  // ========================================
  // SYSTÈME D'XP ET DE NIVEAUX
  // ========================================

  @Get('me/xp')
  @ApiOperation({ summary: 'Récupérer le niveau et l\'XP de l\'utilisateur connecté' })
  @ApiResponse({
    status: 200,
    description: 'Informations sur le niveau et l\'XP',
    schema: {
      type: 'object',
      properties: {
        level: { type: 'number', example: 5 },
        totalXp: { type: 'number', example: 850 },
        currentLevelXp: { type: 'number', example: 50 },
        xpForNextLevel: { type: 'number', example: 150 },
      },
    },
  })
  async getMyXp(@Req() req) {
    const userId = req.user.userId;
    return this.usersService.getUserLevelAndXp(userId);
  }

  @Post('me/xp/gain')
  @ApiOperation({ summary: 'Ajouter de l\'XP à l\'utilisateur connecté' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        xp: {
          type: 'number',
          description: 'Quantité d\'XP à ajouter',
          example: 50,
        },
      },
      required: ['xp'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'XP ajouté avec succès',
    schema: {
      type: 'object',
      properties: {
        level: { type: 'number', example: 5 },
        totalXp: { type: 'number', example: 900 },
        currentLevelXp: { type: 'number', example: 100 },
        xpForNextLevel: { type: 'number', example: 100 },
        leveledUp: { type: 'boolean', example: false },
        previousLevel: { type: 'number', example: 4 },
      },
    },
  })
  async gainXp(@Body() body: { xp: number }, @Req() req) {
    const userId = req.user.userId;
    const { xp } = body;

    if (!xp || xp <= 0) {
      throw new BadRequestException('XP must be a positive number');
    }

    return this.usersService.gainXp(userId, xp);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Mettre à jour le profil de l\'utilisateur connecté' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Profil mis à jour avec succès',
    type: UserEntity,
  })
  async updateMyProfile(@Body() body: UpdateUserDto, @Req() req) {
    const userId = req.user.userId;
    return this.usersService.updateUser(userId, body);
  }
}
