import { Injectable, BadRequestException } from '@nestjs/common';
import prisma from '../../config/prisma';
import { OnboardingStatus } from '@prisma/client';
import type { InterestType, GrowthType } from '@prisma/client';
import { OnboardingProgressDto } from './dto/onboarding-progress.dto';
import { OnboardingCompleteDto } from './dto/onboarding-complete.dto';

@Injectable()
export class OnboardingService {
  async getState(userId: string) {
    let process = await prisma.onboardingProcess.findUnique({
      where: { userId },
    });

    if (!process) {
      process = await prisma.onboardingProcess.create({
        data: {
          userId,
          status: OnboardingStatus.NOT_STARTED,
          startedAt: new Date(),
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
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
      },
    });

    return {
      status: process.status,
      startedAt: process.startedAt,
      completedAt: process.completedAt,
      lastStep: process.lastStep,
      version: process.version,
      preferences: {
        currentPositionId: user?.currentPositionId ?? null,
        interests: user?.interests ?? [],
        growthType: user?.growthType ?? null,
        currentPosition: user?.currentPosition ?? null,
      },
    };
  }

  async start(userId: string) {
    let process = await prisma.onboardingProcess.findUnique({
      where: { userId },
    });

    if (!process) {
      process = await prisma.onboardingProcess.create({
        data: {
          userId,
          status: OnboardingStatus.NOT_STARTED,
          startedAt: new Date(),
        },
      });
    } else if (process.status === OnboardingStatus.NOT_STARTED) {
      process = await prisma.onboardingProcess.update({
        where: { id: process.id },
        data: { startedAt: new Date() },
      });
    }

    return this.getState(userId);
  }

  async saveProgress(userId: string, dto: OnboardingProgressDto) {
    if (dto.currentPositionId) {
      const position = await prisma.position.findUnique({
        where: { id: dto.currentPositionId },
      });
      if (!position) {
        throw new BadRequestException('Position not found');
      }
    }

    const updateData: {
      currentPositionId?: string;
      interests?: InterestType[];
      growthType?: GrowthType;
    } = {};
    if (dto.currentPositionId !== undefined)
      updateData.currentPositionId = dto.currentPositionId;
    if (dto.interests !== undefined) updateData.interests = dto.interests;
    if (dto.growthType !== undefined) updateData.growthType = dto.growthType;

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    const process = await prisma.onboardingProcess.findUnique({
      where: { userId },
    });

    if (!process) {
      await prisma.onboardingProcess.create({
        data: {
          userId,
          status: OnboardingStatus.IN_PROGRESS,
          startedAt: new Date(),
          lastStep: dto.lastStep ?? 1,
          version: 1,
        },
      });
    } else if (process.status !== OnboardingStatus.COMPLETED) {
      await prisma.onboardingProcess.update({
        where: { id: process.id },
        data: {
          status: OnboardingStatus.IN_PROGRESS,
          lastStep: dto.lastStep ?? process.lastStep,
          updatedAt: new Date(),
        },
      });
    }

    return this.getState(userId);
  }

  async complete(userId: string, dto: OnboardingCompleteDto) {
    const position = await prisma.position.findUnique({
      where: { id: dto.currentPositionId },
    });
    if (!position) {
      throw new BadRequestException('Position not found');
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          currentPositionId: dto.currentPositionId,
          interests: dto.interests,
          growthType: dto.growthType,
        },
      }),
      prisma.onboardingProcess.upsert({
        where: { userId },
        create: {
          userId,
          status: OnboardingStatus.COMPLETED,
          startedAt: now,
          completedAt: now,
          lastStep: 3,
          version: 1,
        },
        update: {
          status: OnboardingStatus.COMPLETED,
          completedAt: now,
          lastStep: 3,
          updatedAt: now,
        },
      }),
    ]);

    return this.getState(userId);
  }
}
