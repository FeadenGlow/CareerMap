import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSkillsDto {
  @ApiProperty({ type: [String], description: 'Array of skill IDs' })
  @IsArray()
  @IsString({ each: true })
  skillIds: string[];
}

