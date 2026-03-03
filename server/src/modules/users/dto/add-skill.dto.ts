import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSkillDto {
  @ApiProperty()
  @IsString()
  skillId: string;

  @ApiProperty({ minimum: 0, maximum: 100, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  level?: number;
}
