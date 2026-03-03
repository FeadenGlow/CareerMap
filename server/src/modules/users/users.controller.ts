import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PutSkillsDto } from './dto/put-skills.dto';
import { AddSkillDto } from './dto/add-skill.dto';
import { PatchSkillLevelDto } from './dto/patch-skill-level.dto';

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
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Put(':id/position')
  @UseGuards(RolesGuard)
  @Roles('HR', 'ADMIN')
  @ApiOperation({ summary: 'Update user position (HR/Admin only)' })
  async updateUserPosition(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.usersService.updateUserPosition(id, updatePositionDto);
  }

  @Get('profile/skills')
  @ApiOperation({ summary: 'Get current user skills with levels' })
  async getUserSkills(@Request() req) {
    return this.usersService.getUserSkills(req.user.id);
  }

  @Put('profile/skills')
  @ApiOperation({
    summary: 'Replace current user skills (atomic). Duplicate skillId returns 400.',
  })
  async putSkills(@Request() req, @Body() putSkillsDto: PutSkillsDto) {
    return this.usersService.putSkills(req.user.id, putSkillsDto);
  }

  @Post('profile/skills')
  @ApiOperation({ summary: 'Add one skill for current user' })
  async addSkill(@Request() req, @Body() addSkillDto: AddSkillDto) {
    return this.usersService.addSkill(req.user.id, addSkillDto);
  }

  @Patch('profile/skills/:skillId')
  @ApiOperation({ summary: 'Update skill level for current user' })
  async updateSkillLevel(
    @Request() req,
    @Param('skillId') skillId: string,
    @Body() patchSkillLevelDto: PatchSkillLevelDto,
  ) {
    return this.usersService.updateSkillLevel(
      req.user.id,
      skillId,
      patchSkillLevelDto,
    );
  }

  @Delete('profile/skills/:skillId')
  @ApiOperation({ summary: 'Remove skill for current user' })
  async deleteSkill(@Request() req, @Param('skillId') skillId: string) {
    return this.usersService.deleteSkill(req.user.id, skillId);
  }
}
