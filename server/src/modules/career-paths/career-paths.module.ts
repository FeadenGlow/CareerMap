import { Module } from '@nestjs/common';
import { CareerPathsService } from './career-paths.service';
import { CareerPathsController } from './career-paths.controller';

@Module({
  controllers: [CareerPathsController],
  providers: [CareerPathsService],
  exports: [CareerPathsService],
})
export class CareerPathsModule {}

