import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { IaService } from './ia.service';
import { CreateIaDto } from './dto/create-ia.dto';
import { UpdateIaDto } from './dto/update-ia.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

@Controller('api/v1/ia')
export class IaController {
  constructor(private readonly iaService: IaService) { }

}
