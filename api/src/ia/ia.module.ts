// src/ia/ia.module.ts
import { Module } from '@nestjs/common';
import { IaService } from './ia.service';
import { GroqClient } from './groq/groq.client';
import { PromptBuilder } from './groq/prompt.builder';
import { PrismaService } from 'prisma/prisma.service';
import { ScoringModule } from './scoring/scoring.module';

@Module({
  imports: [ScoringModule],
  providers: [IaService, GroqClient, PromptBuilder, PrismaService],
  exports: [IaService],
})
export class IaModule { }
