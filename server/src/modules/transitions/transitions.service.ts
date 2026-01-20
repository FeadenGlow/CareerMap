import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import prisma from '../../config/prisma';
import { CreateTransitionDto } from './dto/create-transition.dto';
import { UpdateTransitionDto } from './dto/update-transition.dto';

@Injectable()
export class TransitionsService {
  async findAll() {
    return prisma.transition.findMany({
      include: {
        fromPosition: true,
        toPosition: true,
        requiredSkills: true,
      },
    });
  }

  async findOne(id: string) {
    const transition = await prisma.transition.findUnique({
      where: { id },
      include: {
        fromPosition: true,
        toPosition: true,
        requiredSkills: true,
      },
    });

    if (!transition) {
      throw new NotFoundException('Transition not found');
    }

    return transition;
  }

  async create(createTransitionDto: CreateTransitionDto) {
    const fromPosition = await prisma.position.findUnique({
      where: { id: createTransitionDto.fromPositionId },
    });

    if (!fromPosition) {
      throw new NotFoundException('From position not found');
    }

    const toPosition = await prisma.position.findUnique({
      where: { id: createTransitionDto.toPositionId },
    });

    if (!toPosition) {
      throw new NotFoundException('To position not found');
    }

    if (createTransitionDto.fromPositionId === createTransitionDto.toPositionId) {
      throw new BadRequestException('From and to positions cannot be the same');
    }

    if (createTransitionDto.requiredSkillIds && createTransitionDto.requiredSkillIds.length > 0) {
      const skills = await prisma.skill.findMany({
        where: {
          id: {
            in: createTransitionDto.requiredSkillIds,
          },
        },
      });

      if (skills.length !== createTransitionDto.requiredSkillIds.length) {
        throw new NotFoundException('One or more skills not found');
      }
    }

    return prisma.transition.create({
      data: {
        type: createTransitionDto.type,
        fromPositionId: createTransitionDto.fromPositionId,
        toPositionId: createTransitionDto.toPositionId,
        requiredSkills: {
          connect: createTransitionDto.requiredSkillIds?.map((id) => ({ id })) || [],
        },
      },
      include: {
        fromPosition: true,
        toPosition: true,
        requiredSkills: true,
      },
    });
  }

  async update(id: string, updateTransitionDto: UpdateTransitionDto) {
    const transition = await prisma.transition.findUnique({
      where: { id },
    });

    if (!transition) {
      throw new NotFoundException('Transition not found');
    }

    if (updateTransitionDto.fromPositionId) {
      const fromPosition = await prisma.position.findUnique({
        where: { id: updateTransitionDto.fromPositionId },
      });

      if (!fromPosition) {
        throw new NotFoundException('From position not found');
      }
    }

    if (updateTransitionDto.toPositionId) {
      const toPosition = await prisma.position.findUnique({
        where: { id: updateTransitionDto.toPositionId },
      });

      if (!toPosition) {
        throw new NotFoundException('To position not found');
      }
    }

    if (
      updateTransitionDto.fromPositionId &&
      updateTransitionDto.toPositionId &&
      updateTransitionDto.fromPositionId === updateTransitionDto.toPositionId
    ) {
      throw new BadRequestException('From and to positions cannot be the same');
    }

    if (updateTransitionDto.requiredSkillIds) {
      const skills = await prisma.skill.findMany({
        where: {
          id: {
            in: updateTransitionDto.requiredSkillIds,
          },
        },
      });

      if (skills.length !== updateTransitionDto.requiredSkillIds.length) {
        throw new NotFoundException('One or more skills not found');
      }
    }

    return prisma.transition.update({
      where: { id },
      data: {
        ...(updateTransitionDto.type && { type: updateTransitionDto.type }),
        ...(updateTransitionDto.fromPositionId && { fromPositionId: updateTransitionDto.fromPositionId }),
        ...(updateTransitionDto.toPositionId && { toPositionId: updateTransitionDto.toPositionId }),
        ...(updateTransitionDto.requiredSkillIds && {
          requiredSkills: {
            set: updateTransitionDto.requiredSkillIds.map((skillId) => ({ id: skillId })),
          },
        }),
      },
      include: {
        fromPosition: true,
        toPosition: true,
        requiredSkills: true,
      },
    });
  }

  async remove(id: string) {
    const transition = await prisma.transition.findUnique({
      where: { id },
    });

    if (!transition) {
      throw new NotFoundException('Transition not found');
    }

    return prisma.transition.delete({
      where: { id },
    });
  }
}

