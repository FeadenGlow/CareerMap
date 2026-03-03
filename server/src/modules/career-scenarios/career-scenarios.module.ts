import { Module } from '@nestjs/common';
import { CareerScenariosController } from './career-scenarios.controller';
import { CareerScenariosService } from './career-scenarios.service';

@Module({
  controllers: [CareerScenariosController],
  providers: [CareerScenariosService],
  exports: [CareerScenariosService],
})
export class CareerScenariosModule {}
