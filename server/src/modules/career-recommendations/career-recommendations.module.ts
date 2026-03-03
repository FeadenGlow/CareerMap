import { Module } from '@nestjs/common';
import { CareerRecommendationsController } from './career-recommendations.controller';
import { CareerRecommendationService } from './career-recommendations.service';

@Module({
  controllers: [CareerRecommendationsController],
  providers: [CareerRecommendationService],
  exports: [CareerRecommendationService],
})
export class CareerRecommendationsModule {}
