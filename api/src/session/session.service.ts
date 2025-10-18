import { Injectable } from '@nestjs/common';
import { CreateTrainingSessionDto } from './dto/create-session.dto';
import { UpdateTrainingSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionService {
  create(createSessionDto: CreateTrainingSessionDto) {
    return 'This action adds a new session';
  }

  findAll() {
    return `This action returns all session`;
  }

  findOne(id: number) {
    return `This action returns a #${id} session`;
  }

  update(id: number, updateSessionDto: UpdateTrainingSessionDto) {
    return `This action updates a #${id} session`;
  }

  remove(id: number) {
    return `This action removes a #${id} session`;
  }
}
