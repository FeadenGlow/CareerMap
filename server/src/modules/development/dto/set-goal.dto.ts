import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetGoalDto {
  @ApiProperty()
  @IsString()
  targetPositionId: string;
}
