import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsUUID,
  ValidateIf,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MAX_DEPTH_CAP,
  TOP_N_CAP,
} from '../../../config/recommendations.constants';
import {
  type CareerScenarioType,
  CareerScenarioTypeEnum,
} from '../../../config/career-scenarios.constants';

export class RecommendationsQueryDto {
  @ApiPropertyOptional({ default: 10, maximum: TOP_N_CAP })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(TOP_N_CAP)
  limit?: number = 10;

  @ApiPropertyOptional({ default: 7, maximum: MAX_DEPTH_CAP })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_DEPTH_CAP)
  maxDepth?: number = 7;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf(
    (o: RecommendationsQueryDto) =>
      o.targetPositionId != null && o.targetPositionId !== '',
  )
  @IsUUID('4')
  targetPositionId?: string;

  @ApiPropertyOptional({
    enum: ['FAST_GROWTH', 'EXPERT_PATH', 'MANAGER_PATH'],
    description:
      'Override scenario for this request only (does not save to user)',
  })
  @IsOptional()
  @IsEnum(CareerScenarioTypeEnum)
  scenario?: CareerScenarioType;
}
