import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import {
  type CareerScenarioType,
  CareerScenarioTypeEnum,
} from '../../../config/career-scenarios.constants';

export class SetActiveScenarioDto {
  @ApiProperty({ enum: ['FAST_GROWTH', 'EXPERT_PATH', 'MANAGER_PATH'] })
  @IsEnum(CareerScenarioTypeEnum)
  scenario: CareerScenarioType;
}
