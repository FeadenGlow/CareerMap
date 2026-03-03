import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CareerRecommendationService } from './career-recommendations.service';
import { RecommendationsQueryDto } from './dto/recommendations-query.dto';

@ApiTags('career-recommendations')
@Controller('career-recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CareerRecommendationsController {
  constructor(
    private readonly careerRecommendationService: CareerRecommendationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get personalized career path recommendations' })
  async getRecommendations(
    @Request() req: { user?: { id: string } },
    @Query() query: RecommendationsQueryDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return {
        startPositionId: null,
        reason: 'noStartPosition',
        recommendations: [],
      };
    }
    return this.careerRecommendationService.getRecommendations(userId, {
      limit: query.limit,
      maxDepth: query.maxDepth,
      targetPositionId: query.targetPositionId,
      scenario: query.scenario,
    });
  }
}
