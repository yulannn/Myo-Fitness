import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { FitnessProfileService } from './fitness-profile.service';
import { CreateFitnessProfileDto } from './dto/create-fitness-profile.dto';
import { UpdateFitnessProfileDto } from './dto/update-fitness-profile.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('fitness-profile')
export class FitnessProfileController {
  constructor(private readonly fitnessProfileService: FitnessProfileService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createFitnessProfileDto: CreateFitnessProfileDto, @Request() req) {
    const userId = req.user.userId;
    return this.fitnessProfileService.create(createFitnessProfileDto, userId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Request() req) {
    const userId = req.user.userId;
    return this.fitnessProfileService.findAll(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return this.fitnessProfileService.findOne(+id, userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateFitnessProfileDto: UpdateFitnessProfileDto, @Request() req) {
    const userId = req.user.userId;
    return this.fitnessProfileService.update(+id, updateFitnessProfileDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fitnessProfileService.remove(+id);
  }
}
