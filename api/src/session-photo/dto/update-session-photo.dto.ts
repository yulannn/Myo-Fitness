import { PartialType } from '@nestjs/swagger';
import { CreateSessionPhotoDto } from './create-session-photo.dto';

export class UpdateSessionPhotoDto extends PartialType(CreateSessionPhotoDto) {}
