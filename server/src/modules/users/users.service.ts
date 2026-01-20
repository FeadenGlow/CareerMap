import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import prisma from '../../config/prisma';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { UpdateSkillsDto } from './dto/update-skills.dto';

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
        skills: {
          include: {
            skill: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      skills: user.skills.map((us) => us.skill),
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

  async updateUserPosition(userId: string, updatePositionDto: UpdatePositionDto) {
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

  async updateUserSkills(userId: string, updateSkillsDto: UpdateSkillsDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await prisma.userSkill.deleteMany({
      where: { userId },
    });

    if (updateSkillsDto.skillIds.length > 0) {
      await prisma.userSkill.createMany({
        data: updateSkillsDto.skillIds.map((skillId) => ({
          userId,
          skillId,
        })),
      });
    }

    return this.getProfile(userId);
  }

  async getUserSkills(userId: string) {
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: {
        skill: true,
      },
    });

    return userSkills.map((us) => us.skill);
  }
}

