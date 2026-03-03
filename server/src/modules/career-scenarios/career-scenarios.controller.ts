import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CareerScenariosService } from './career-scenarios.service';
import { SetActiveScenarioDto } from './dto/set-active-scenario.dto';

@ApiTags('career-scenarios')
@Controller('career-scenarios')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CareerScenariosController {
  constructor(private readonly careerScenariosService: CareerScenariosService) {}

  @Get()
  @ApiOperation({ summary: 'Get available scenarios and active one' })
  async getScenarios(@Request() req: { user: { id: string } }) {
    return this.careerScenariosService.getScenarios(req.user.id);
  }

  @Put('active')
  @ApiOperation({ summary: 'Set active career scenario' })
  async setActive(
    @Request() req: { user: { id: string } },
    @Body() dto: SetActiveScenarioDto,
  ) {
    return this.careerScenariosService.setActiveScenario(req.user.id, dto.scenario);
  }
}
