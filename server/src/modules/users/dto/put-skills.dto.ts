import {
  IsArray,
  ValidateNested,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SkillLevelItemDto {
  @ApiProperty()
  @IsString()
  skillId: string;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  level: number;
}

export class PutSkillsDto {
  @ApiProperty({ type: [SkillLevelItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillLevelItemDto)
  skills: SkillLevelItemDto[];
}
