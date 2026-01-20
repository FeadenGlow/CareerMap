import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CareerPathsService } from './career-paths.service';

@ApiTags('career-paths')
@Controller('career-paths')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CareerPathsController {
  constructor(private readonly careerPathsService: CareerPathsService) {}

  @Get()
  @ApiOperation({ summary: 'Get career graph' })
  async getCareerGraph(@Request() req) {
    return this.careerPathsService.getCareerGraph(req.user?.id);
  }

  @Get('from/:positionId')
  @ApiOperation({ summary: 'Get career paths from specific position' })
  async getCareerPathsFromPosition(@Param('positionId') positionId: string, @Request() req) {
    return this.careerPathsService.getCareerPathsFromPosition(positionId, req.user?.id);
  }
}

