import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import prisma from '../../config/prisma';
import {
  SKILL_LEVEL_DEFAULT,
  SKILL_LEVEL_MIN,
  SKILL_LEVEL_MAX,
} from '../../config/development.constants';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PutSkillsDto } from './dto/put-skills.dto';
import { AddSkillDto } from './dto/add-skill.dto';
import { PatchSkillLevelDto } from './dto/patch-skill-level.dto';

@Injectable()
export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        positionId: true,
        position: {
          select: {
            id: true,
            title: true,
            level: true,
            department: true,
          },
        },
        currentPositionId: true,
        interests: true,
        growthType: true,
        currentPosition: {
          select: {
            id: true,
            title: true,
            level: true,
            department: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        onboardingProcess: { select: { status: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { onboardingProcess, ...rest } = user;
    return {
      ...rest,
      onboardingStatus: onboardingProcess?.status ?? 'NOT_STARTED',
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: updateProfileDto.email },
      });

      if (existingUser) {
        throw new ForbiddenException('Email already in use');
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        role: true,
        positionId: true,
      },
    });
  }

  async updateUserPosition(
    userId: string,
    updatePositionDto: UpdatePositionDto,
  ) {
    const position = await prisma.position.findUnique({
      where: { id: updatePositionDto.positionId },
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { positionId: updatePositionDto.positionId },
      select: {
        id: true,
        email: true,
        role: true,
        positionId: true,
        position: {
          select: {
            id: true,
            title: true,
            level: true,
            department: true,
          },
        },
      },
    });
  }

  async getUserSkills(userId: string) {
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: {
        skill: true,
      },
    });

    return userSkills.map((us) => ({
      skillId: us.skillId,
      skill: {
        id: us.skill.id,
        name: us.skill.name,
        category: us.skill.category,
      },
      level: us.level,
    }));
  }

  async putSkills(userId: string, dto: PutSkillsDto) {
    const skillIds = dto.skills.map((s) => s.skillId);
    const uniqueIds = new Set(skillIds);
    if (uniqueIds.size !== skillIds.length) {
      throw new BadRequestException('Duplicate skillId in request body');
    }

    for (const item of dto.skills) {
      const skill = await prisma.skill.findUnique({
        where: { id: item.skillId },
      });
      if (!skill) {
        throw new NotFoundException(`Skill not found: ${item.skillId}`);
      }
    }

    await prisma.userSkill.deleteMany({
      where: { userId },
    });

    if (dto.skills.length > 0) {
      await prisma.userSkill.createMany({
        data: dto.skills.map((item) => ({
          userId,
          skillId: item.skillId,
          level: Math.max(
            SKILL_LEVEL_MIN,
            Math.min(SKILL_LEVEL_MAX, item.level),
          ),
        })),
      });
    }

    return this.getUserSkills(userId);
  }

  async addSkill(userId: string, dto: AddSkillDto) {
    const skill = await prisma.skill.findUnique({
      where: { id: dto.skillId },
    });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    const level =
      dto.level !== undefined
        ? Math.max(SKILL_LEVEL_MIN, Math.min(SKILL_LEVEL_MAX, dto.level))
        : SKILL_LEVEL_DEFAULT;

    const existing = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: { userId, skillId: dto.skillId },
      },
    });
    if (existing) {
      throw new BadRequestException('User already has this skill');
    }

    await prisma.userSkill.create({
      data: {
        userId,
        skillId: dto.skillId,
        level,
      },
    });

    return this.getUserSkills(userId);
  }

  async updateSkillLevel(
    userId: string,
    skillId: string,
    dto: PatchSkillLevelDto,
  ) {
    const level = Math.max(
      SKILL_LEVEL_MIN,
      Math.min(SKILL_LEVEL_MAX, dto.level),
    );

    const updated = await prisma.userSkill.updateMany({
      where: {
        userId,
        skillId,
      },
      data: { level },
    });

    if (updated.count === 0) {
      throw new NotFoundException('User skill not found');
    }

    return this.getUserSkills(userId);
  }

  async deleteSkill(userId: string, skillId: string) {
    const deleted = await prisma.userSkill.deleteMany({
      where: {
        userId,
        skillId,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundException('User skill not found');
    }

    return this.getUserSkills(userId);
  }
}
