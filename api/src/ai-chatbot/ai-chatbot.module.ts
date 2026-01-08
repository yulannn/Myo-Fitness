import { Module } from '@nestjs/common';
import { AiChatbotService } from './ai-chatbot.service';
import { AiChatbotController } from './ai-chatbot.controller';
import { PrismaService } from 'prisma/prisma.service';
import { GroqClient } from '../ia/groq/groq.client';

@Module({
    controllers: [AiChatbotController],
    providers: [AiChatbotService, PrismaService, GroqClient],
    exports: [AiChatbotService],
})
export class AiChatbotModule { }
