import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DevelopmentService } from './development.service';
import { SetGoalDto } from './dto/set-goal.dto';

@ApiTags('development')
@Controller('development')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DevelopmentController {
  constructor(private readonly developmentService: DevelopmentService) {}

  @Get('goal')
  @ApiOperation({ summary: 'Get current user development goal' })
  async getGoal(@Request() req: { user: { id: string } }) {
    return this.developmentService.getGoal(req.user.id);
  }

  @Put('goal')
  @ApiOperation({ summary: 'Set current user development goal' })
  async setGoal(
    @Request() req: { user: { id: string } },
    @Body() setGoalDto: SetGoalDto,
  ) {
    return this.developmentService.setGoal(
      req.user.id,
      setGoalDto.targetPositionId,
    );
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Get development profile (skills, goal, skill gaps, readiness)',
  })
  async getProfile(@Request() req: { user: { id: string } }) {
    return this.developmentService.getDevelopmentProfile(req.user.id);
  }
}
