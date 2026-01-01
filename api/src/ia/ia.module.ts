// src/ia/ia.module.ts
import { Module } from '@nestjs/common';
import { IaService } from './ia.service';
import { GroqClient } from './groq/groq.client';
import { PromptBuilder } from './groq/prompt.builder';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [IaService, GroqClient, PromptBuilder, PrismaService],
  exports: [IaService],
})
export class IaModule { }
