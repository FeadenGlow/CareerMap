import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePositionDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  positionId: string;
}

