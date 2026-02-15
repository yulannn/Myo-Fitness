import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { AddReactionDto } from './dto/add-reaction.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('api/v1/chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  createConversation(@Body() dto: CreateConversationDto, @Req() req: any) {
    return this.chatService.createConversation(dto, req.user.userId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all user conversations' })
  getUserConversations(@Req() req: any) {
    return this.chatService.getUserConversations(req.user.userId);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation details' })
  getConversation(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.chatService.getConversation(id, req.user.userId);
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Leave a conversation' })
  leaveConversation(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.chatService.leaveConversation(id, req.user.userId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages from a conversation' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('skip', new ParseIntPipe({ optional: true })) skip = 0,
    @Query('take', new ParseIntPipe({ optional: true })) take = 50,
    @Req() req: any,
  ) {
    return this.chatService.getMessages(id, req.user.userId, skip, take);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message' })
  sendMessage(@Body() dto: SendMessageDto, @Req() req: any) {
    return this.chatService.sendMessage(dto, req.user.userId);
  }

  @Patch('messages/:id')
  @ApiOperation({ summary: 'Update a message' })
  updateMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMessageDto,
    @Req() req: any,
  ) {
    return this.chatService.updateMessage(id, dto, req.user.userId);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete a message' })
  deleteMessage(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.chatService.deleteMessage(id, req.user.userId);
  }

  @Patch('conversations/:id/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  markAsRead(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.chatService.markAsRead(id, req.user.userId);
  }

  @Post('reactions')
  @ApiOperation({ summary: 'Add or remove a reaction' })
  addReaction(@Body() dto: AddReactionDto, @Req() req: any) {
    return this.chatService.addReaction(dto, req.user.userId);
  }
}
