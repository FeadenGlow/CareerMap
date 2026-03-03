import {
  IsString,
  IsEnum,
  IsArray,
  ArrayUnique,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InterestType, GrowthType } from '@prisma/client';

export class OnboardingCompleteDto {
  @ApiProperty()
  @IsString()
  currentPositionId: string;

  @ApiProperty({ enum: InterestType, isArray: true, minItems: 1, maxItems: 3 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ArrayUnique()
  @IsEnum(InterestType, { each: true })
  interests: InterestType[];

  @ApiProperty({ enum: GrowthType })
  @IsEnum(GrowthType)
  growthType: GrowthType;
}
