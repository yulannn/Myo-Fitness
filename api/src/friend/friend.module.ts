import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { ChatModule } from '../chat/chat.module';
import { R2Module } from '../r2/r2.module';

@Module({
  imports: [ChatModule, R2Module],
  controllers: [FriendController],
  providers: [FriendService],
})
export class FriendModule {}
