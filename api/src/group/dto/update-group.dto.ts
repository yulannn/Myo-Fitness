import { CreateGroupDto } from './create-group.dto';
import { PartialType } from '@nestjs/mapped-types/dist/partial-type.helper';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {}