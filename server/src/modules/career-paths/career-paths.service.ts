import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '../../config/prisma';

@Injectable()
export class CareerPathsService {
  async getCareerGraph(userId?: string) {
    const positions = await prisma.position.findMany({
      orderBy: [
        { level: 'asc' },
        { title: 'asc' },
      ],
    });

    const transitions = await prisma.transition.findMany({
      include: {
        fromPosition: true,
        toPosition: true,
        requiredSkills: true,
      },
    });

    let userSkills: string[] = [];
    if (userId) {
      const userSkillsData = await prisma.userSkill.findMany({
        where: { userId },
        select: { skillId: true },
      });
      userSkills = userSkillsData.map((us) => us.skillId);
    }

    return {
      positions: positions.map((position) => ({
        id: position.id,
        title: position.title,
        level: position.level,
        department: position.department,
      })),
      transitions: transitions.map((transition) => {
        const requiredSkillIds = transition.requiredSkills.map((s) => s.id);
        const hasAllSkills = requiredSkillIds.length === 0 || requiredSkillIds.every((skillId) => userSkills.includes(skillId));
        const hasSomeSkills = requiredSkillIds.length > 0 && requiredSkillIds.some((skillId) => userSkills.includes(skillId));
        
        return {
          id: transition.id,
          type: transition.type,
          fromPositionId: transition.fromPositionId,
          toPositionId: transition.toPositionId,
          requiredSkills: transition.requiredSkills.map((skill) => ({
            id: skill.id,
            name: skill.name,
            category: skill.category,
          })),
          isRecommended: hasAllSkills,
          isPartiallyAvailable: hasSomeSkills && !hasAllSkills,
          missingSkills: requiredSkillIds.filter((skillId) => !userSkills.includes(skillId)),
        };
      }),
    };
  }

  async getCareerPathsFromPosition(positionId: string, userId?: string) {
    const position = await prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    let userSkills: string[] = [];
    if (userId) {
      const userSkillsData = await prisma.userSkill.findMany({
        where: { userId },
        select: { skillId: true },
      });
      userSkills = userSkillsData.map((us) => us.skillId);
    }

    const transitions = await prisma.transition.findMany({
      where: { fromPositionId: positionId },
      include: {
        toPosition: true,
        requiredSkills: true,
      },
    });

    const reachablePositions = new Set<string>();
    const visited = new Set<string>();
    const queue = [positionId];

    while (queue.length > 0) {
      const currentPositionId = queue.shift();
      if (!currentPositionId || visited.has(currentPositionId)) continue;
      visited.add(currentPositionId);

      const nextTransitions = await prisma.transition.findMany({
        where: { fromPositionId: currentPositionId },
        include: {
          toPosition: true,
          requiredSkills: true,
        },
      });

      for (const transition of nextTransitions) {
        reachablePositions.add(transition.toPositionId);
        if (!visited.has(transition.toPositionId)) {
          queue.push(transition.toPositionId);
        }
      }
    }

    const allReachablePositions = await prisma.position.findMany({
      where: {
        id: {
          in: Array.from(reachablePositions),
        },
      },
    });

    return {
      fromPosition: {
        id: position.id,
        title: position.title,
        level: position.level,
        department: position.department,
      },
      directTransitions: transitions.map((transition) => {
        const requiredSkillIds = transition.requiredSkills.map((s) => s.id);
        const hasAllSkills = requiredSkillIds.length === 0 || requiredSkillIds.every((skillId) => userSkills.includes(skillId));
        const hasSomeSkills = requiredSkillIds.length > 0 && requiredSkillIds.some((skillId) => userSkills.includes(skillId));
        
        return {
          id: transition.id,
          type: transition.type,
          toPosition: {
            id: transition.toPosition.id,
            title: transition.toPosition.title,
            level: transition.toPosition.level,
            department: transition.toPosition.department,
          },
          requiredSkills: transition.requiredSkills.map((skill) => ({
            id: skill.id,
            name: skill.name,
            category: skill.category,
          })),
          isRecommended: hasAllSkills,
          isPartiallyAvailable: hasSomeSkills && !hasAllSkills,
          missingSkills: requiredSkillIds.filter((skillId) => !userSkills.includes(skillId)),
        };
      }),
      reachablePositions: allReachablePositions.map((pos) => ({
        id: pos.id,
        title: pos.title,
        level: pos.level,
        department: pos.department,
      })),
    };
  }
}

