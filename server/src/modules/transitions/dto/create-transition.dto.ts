import { IsString, IsEnum, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransitionType } from '@prisma/client';

export class CreateTransitionDto {
  @ApiProperty({ enum: TransitionType })
  @IsEnum(TransitionType)
  type: TransitionType;

  @ApiProperty()
  @IsString()
  @IsUUID()
  fromPositionId: string;

  @ApiProperty()
  @IsString()
  @IsUUID()
  toPositionId: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsUUID(4, { each: true })
  requiredSkillIds?: string[];
}

