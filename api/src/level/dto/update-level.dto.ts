import { CreateLevelDto } from "./create-level.dto";
import { PartialType } from "@nestjs/mapped-types/dist/partial-type.helper";

export class UpdateLevelDto extends PartialType(CreateLevelDto) {}