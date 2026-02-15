import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiChatbotService } from './ai-chatbot.service';
import type { ChatRequest } from './ai-chatbot.types';

@Controller('api/v1/ai-chatbot')
@UseGuards(AuthGuard('jwt'))
export class AiChatbotController {
  constructor(private readonly chatbotService: AiChatbotService) {}

  /**
   * 💬 POST /ai-chatbot/chat
   * Envoyer un message au chatbot
   */
  @Post('chat')
  async chat(@Req() req: any, @Body() body: ChatRequest) {
    const userId = req.user.userId;
    return this.chatbotService.chat(userId, body.message);
  }

  /**
   * 📜 GET /ai-chatbot/history
   * Récupérer l'historique des conversations
   */
  @Get('history')
  async getHistory(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const userId = req.user.userId;
    return this.chatbotService.getHistory(
      userId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  /**
   * 🗑️ DELETE /ai-chatbot/history
   * Effacer l'historique
   */
  @Delete('history')
  async clearHistory(@Req() req: any) {
    const userId = req.user.userId;
    return this.chatbotService.clearHistory(userId);
  }

  /**
   * 📊 GET /ai-chatbot/stats
   * Statistiques d'utilisation
   */
  @Get('stats')
  async getStats(@Req() req: any) {
    const userId = req.user.userId;
    return this.chatbotService.getUserStats(userId);
  }
}
