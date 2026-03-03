import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  ArrayUnique,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InterestType, GrowthType } from '@prisma/client';

export class OnboardingProgressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentPositionId?: string;

  @ApiPropertyOptional({ enum: InterestType, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(InterestType, { each: true })
  interests?: InterestType[];

  @ApiPropertyOptional({ enum: GrowthType })
  @IsOptional()
  @IsEnum(GrowthType)
  growthType?: GrowthType;

  @ApiPropertyOptional({ minimum: 1, maximum: 3 })
  @IsOptional()
  @Min(1)
  @Max(3)
  lastStep?: number;
}
