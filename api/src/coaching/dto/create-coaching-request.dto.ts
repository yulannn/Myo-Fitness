import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCoachingRequestDto {
  @ApiProperty({
    description: 'Code unique (friendCode) du pratiquant à coacher',
    example: 'A1B2C3D4',
  })
  @IsString()
  @IsNotEmpty()
  uniqueCode: string;
}
