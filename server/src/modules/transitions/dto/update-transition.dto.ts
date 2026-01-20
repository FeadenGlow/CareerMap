import { IsEnum, IsString, IsArray, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransitionType } from '@prisma/client';

export class UpdateTransitionDto {
  @ApiProperty({ enum: TransitionType, required: false })
  @IsEnum(TransitionType)
  @IsOptional()
  type?: TransitionType;

  @ApiProperty({ required: false })
  @IsString()
  @IsUUID()
  @IsOptional()
  fromPositionId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsUUID()
  @IsOptional()
  toPositionId?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsUUID(4, { each: true })
  @IsOptional()
  requiredSkillIds?: string[];
}

