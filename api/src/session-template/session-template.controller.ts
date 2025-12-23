import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionTemplateService } from './session-template.service';
import { CreateSessionTemplateDto, UpdateSessionTemplateDto } from './dto/session-template.dto';
import { ScheduleSessionDto } from './dto/schedule-session.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/session-templates')
export class SessionTemplateController {
  constructor(private readonly sessionTemplateService: SessionTemplateService) { }

  @Get(':id')
  getTemplate(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.sessionTemplateService.getTemplateById(id, req.user.userId);
  }

  @Post()
  createTemplate(@Body() dto: CreateSessionTemplateDto, @Request() req) {
    return this.sessionTemplateService.createTemplate(dto, req.user.userId);
  }

  @Put(':id')
  updateTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSessionTemplateDto,
    @Request() req,
  ) {
    return this.sessionTemplateService.updateTemplate(id, dto, req.user.userId);
  }

  @Delete(':id')
  deleteTemplate(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.sessionTemplateService.deleteTemplate(id, req.user.userId);
  }

  @Post(':id/schedule')
  scheduleFromTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ScheduleSessionDto,
    @Request() req,
  ) {
    return this.sessionTemplateService.scheduleFromTemplate(id, dto, req.user.userId);
  }

  @Post(':id/start')
  startFromTemplate(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.sessionTemplateService.startFromTemplate(id, req.user.userId);
  }
}
