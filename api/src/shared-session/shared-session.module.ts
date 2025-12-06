import { Module, forwardRef } from '@nestjs/common';
import { SharedSessionService } from './shared-session.service';
import { SharedSessionController } from './shared-session.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { ChatModule } from '../chat/chat.module';
import { GymModule } from '../gym/gym.module';

@Module({
    imports: [PrismaModule, forwardRef(() => ChatModule), GymModule],
    controllers: [SharedSessionController],
    providers: [SharedSessionService],
    exports: [SharedSessionService],
})
export class SharedSessionModule { }
