import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PositionsModule } from './modules/positions/positions.module';
import { SkillsModule } from './modules/skills/skills.module';
import { TransitionsModule } from './modules/transitions/transitions.module';
import { CareerPathsModule } from './modules/career-paths/career-paths.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { DevelopmentModule } from './modules/development/development.module';
import { CareerRecommendationsModule } from './modules/career-recommendations/career-recommendations.module';
import { CareerScenariosModule } from './modules/career-scenarios/career-scenarios.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PositionsModule,
    SkillsModule,
    TransitionsModule,
    CareerPathsModule,
    CareerRecommendationsModule,
    CareerScenariosModule,
    OnboardingModule,
    DevelopmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
