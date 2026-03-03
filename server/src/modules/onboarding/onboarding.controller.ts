import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OnboardingService } from './onboarding.service';
import { OnboardingProgressDto } from './dto/onboarding-progress.dto';
import { OnboardingCompleteDto } from './dto/onboarding-complete.dto';

@ApiTags('onboarding')
@Controller('onboarding')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get()
  @ApiOperation({ summary: 'Get onboarding state and preferences' })
  getState(@Request() req: { user: { id: string } }) {
    return this.onboardingService.getState(req.user.id);
  }

  @Post('start')
  @ApiOperation({ summary: 'Start onboarding process' })
  start(@Request() req: { user: { id: string } }) {
    return this.onboardingService.start(req.user.id);
  }

  @Patch('progress')
  @ApiOperation({ summary: 'Save onboarding progress (draft)' })
  saveProgress(
    @Request() req: { user: { id: string } },
    @Body() dto: OnboardingProgressDto,
  ) {
    return this.onboardingService.saveProgress(req.user.id, dto);
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete onboarding (submit)' })
  complete(
    @Request() req: { user: { id: string } },
    @Body() dto: OnboardingCompleteDto,
  ) {
    return this.onboardingService.complete(req.user.id, dto);
  }
}
