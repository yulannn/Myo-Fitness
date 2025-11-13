import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileUploadInterceptor } from '../interceptors/file-upload.interceptor';
import { SessionPhotoService } from './session-photo.service';
import {
  CreateSessionPhotoDto,
  CreateSessionPhotoDtoWithFile,
} from './dto/create-session-photo.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('session-photo')
@ApiBearerAuth()
@Controller('api/v1/session-photo')
export class SessionPhotoController {
  constructor(private readonly sessionPhotoService: SessionPhotoService) {}

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileUploadInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload d’une photo de séance' })
  @ApiBody({ type: CreateSessionPhotoDtoWithFile })
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: CreateSessionPhotoDto,
    @Request() req,
  ) {
    const photoUrl = `/uploads/photos/${file.filename}`;
    return this.sessionPhotoService.create(
      createDto,
      req.user.userId,
      photoUrl,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les photos' })
  async findAll() {
    return this.sessionPhotoService.findAll();
  }

  @Get('today')
  @ApiOperation({ summary: 'Récupérer les photos d’aujourd’hui' })
  async findByToday() {
    return this.sessionPhotoService.findToday();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une photo par ID' })
  @ApiParam({ name: 'id', type: 'number' })
  async findOne(@Param('id') id: number) {
    return this.sessionPhotoService.findOne(+id);
  }

  @Get('day/:date')
  @ApiOperation({
    summary: 'Récupérer les photos d’une date précise (YYYY-MM-DD)',
  })
  @ApiParam({ name: 'date', example: '2025-11-13' })
  async findByDay(@Param('date') date: string) {
    return this.sessionPhotoService.findByDay(date);
  }

  @Get('today/friends')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Récupérer les photos d’aujourd’hui des amis' })
  async findTodayFromFriends(@Request() req) {
    return this.sessionPhotoService.findTodayFromFriends(req.user.userId);
  }
}
