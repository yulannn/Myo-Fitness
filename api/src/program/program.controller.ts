import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { ProgramService } from './program.service';
import { CreateTrainingProgramDto } from './dto/create-program.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';


@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createProgramDto: CreateTrainingProgramDto, @Request() req) {
    const userId = req.user.userId;
    return this.programService.create(createProgramDto, userId);
  }


}
