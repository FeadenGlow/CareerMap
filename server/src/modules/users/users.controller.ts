import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { UpdateSkillsDto } from './dto/update-skills.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Put(':id/position')
  @UseGuards(RolesGuard)
  @Roles('HR', 'ADMIN')
  @ApiOperation({ summary: 'Update user position (HR/Admin only)' })
  async updateUserPosition(@Param('id') id: string, @Body() updatePositionDto: UpdatePositionDto) {
    return this.usersService.updateUserPosition(id, updatePositionDto);
  }

  @Put('profile/skills')
  @ApiOperation({ summary: 'Update current user skills' })
  async updateUserSkills(@Request() req, @Body() updateSkillsDto: UpdateSkillsDto) {
    return this.usersService.updateUserSkills(req.user.id, updateSkillsDto);
  }

  @Get('profile/skills')
  @ApiOperation({ summary: 'Get current user skills' })
  async getUserSkills(@Request() req) {
    return this.usersService.getUserSkills(req.user.id);
  }
}

