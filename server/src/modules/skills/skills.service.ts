import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '../../config/prisma';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  async findAll() {
    return prisma.skill.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        transitions: {
          include: {
            fromPosition: true,
            toPosition: true,
          },
        },
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  async create(createSkillDto: CreateSkillDto) {
    return prisma.skill.create({
      data: createSkillDto,
    });
  }

  async update(id: string, updateSkillDto: UpdateSkillDto) {
    const skill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return prisma.skill.update({
      where: { id },
      data: updateSkillDto,
    });
  }

  async remove(id: string) {
    const skill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return prisma.skill.delete({
      where: { id },
    });
  }
}

