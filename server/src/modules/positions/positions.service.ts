import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '../../config/prisma';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  async findAll() {
    return prisma.position.findMany({
      orderBy: [
        { level: 'asc' },
        { title: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const position = await prisma.position.findUnique({
      where: { id },
      include: {
        from: {
          include: {
            toPosition: true,
            requiredSkills: true,
          },
        },
        to: {
          include: {
            fromPosition: true,
            requiredSkills: true,
          },
        },
      },
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    return position;
  }

  async create(createPositionDto: CreatePositionDto) {
    return prisma.position.create({
      data: createPositionDto,
    });
  }

  async update(id: string, updatePositionDto: UpdatePositionDto) {
    const position = await prisma.position.findUnique({
      where: { id },
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    return prisma.position.update({
      where: { id },
      data: updatePositionDto,
    });
  }

  async remove(id: string) {
    const position = await prisma.position.findUnique({
      where: { id },
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    return prisma.position.delete({
      where: { id },
    });
  }
}

