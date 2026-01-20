import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PositionsModule } from './modules/positions/positions.module';
import { SkillsModule } from './modules/skills/skills.module';
import { TransitionsModule } from './modules/transitions/transitions.module';
import { CareerPathsModule } from './modules/career-paths/career-paths.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PositionsModule,
    SkillsModule,
    TransitionsModule,
    CareerPathsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
