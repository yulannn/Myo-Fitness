import { PartialType } from '@nestjs/mapped-types';
import { CreateTrainingSessionDto } from '../dto/create-session.dto';

export class UpdateTrainingSessionDto extends PartialType(CreateTrainingSessionDto) { }
