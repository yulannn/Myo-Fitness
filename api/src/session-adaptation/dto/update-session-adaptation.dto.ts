import { PartialType } from '@nestjs/swagger';
import { CreateSessionAdaptationDto } from './create-session-adaptation.dto';

export class UpdateSessionAdaptationDto extends PartialType(
  CreateSessionAdaptationDto,
) {}
