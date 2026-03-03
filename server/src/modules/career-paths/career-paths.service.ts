import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '../../config/prisma';
import { SKILL_SUFFICIENT_LEVEL } from '../../config/development.constants';
import type { SkillInfo } from '../../common/types/skill.types';

interface TransitionReadinessResult {
  readinessPercent: number;
  missingSkills: SkillInfo[];
  partialSkills: Array<
    SkillInfo & { userLevel: number; requiredLevel: number }
  >;
  okSkills: Array<SkillInfo & { userLevel: number }>;
}

@Injectable()
export class CareerPathsService {
  private computeTransitionReadiness(
    requiredSkills: Array<{
      id: string;
      name: string;
      category: string | null;
    }>,
    userLevelBySkill: Map<string, number>,
  ): TransitionReadinessResult {
    const missingSkills: SkillInfo[] = [];
    const partialSkills: Array<
      SkillInfo & { userLevel: number; requiredLevel: number }
    > = [];
    const okSkills: Array<SkillInfo & { userLevel: number }> = [];

    const N = requiredSkills.length;
    if (N === 0) {
      return {
        readinessPercent: 100,
        missingSkills: [],
        partialSkills: [],
        okSkills: [],
      };
    }

    let sumScores = 0;
    for (const skill of requiredSkills) {
      const userLevel = userLevelBySkill.get(skill.id);
      const skillInfo: SkillInfo = {
        id: skill.id,
        name: skill.name,
        category: skill.category,
      };
      if (userLevel === undefined) {
        missingSkills.push(skillInfo);
        sumScores += 0;
      } else if (userLevel < SKILL_SUFFICIENT_LEVEL) {
        partialSkills.push({
          ...skillInfo,
          userLevel,
          requiredLevel: SKILL_SUFFICIENT_LEVEL,
        });
        sumScores +=
          Math.min(userLevel, SKILL_SUFFICIENT_LEVEL) / SKILL_SUFFICIENT_LEVEL;
      } else {
        okSkills.push({ ...skillInfo, userLevel });
        sumScores += 1;
      }
    }

    const readinessPercent = Math.round((sumScores / N) * 100);
    return {
      readinessPercent,
      missingSkills,
      partialSkills,
      okSkills,
    };
  }

  async getCareerGraph(userId?: string) {
    const positions = await prisma.position.findMany({
      orderBy: [{ level: 'asc' }, { title: 'asc' }],
    });

    const transitions = await prisma.transition.findMany({
      include: {
        fromPosition: true,
        toPosition: true,
        requiredSkills: true,
      },
    });

    let userLevelBySkill = new Map<string, number>();
    if (userId) {
      const userSkillsData = await prisma.userSkill.findMany({
        where: { userId },
        select: { skillId: true, level: true },
      });
      userLevelBySkill = new Map(
        userSkillsData.map((us) => [us.skillId, us.level]),
      );
    }

    return {
      positions: positions.map((position) => ({
        id: position.id,
        title: position.title,
        level: position.level,
        department: position.department,
      })),
      transitions: transitions.map((transition) => {
        const requiredSkillsList = transition.requiredSkills.map((skill) => ({
          id: skill.id,
          name: skill.name,
          category: skill.category,
        }));
        const readiness = this.computeTransitionReadiness(
          requiredSkillsList,
          userLevelBySkill,
        );
        const requiredSkillIds = transition.requiredSkills.map((s) => s.id);
        const hasAllSkills =
          requiredSkillIds.length === 0 ||
          requiredSkillIds.every((skillId) => userLevelBySkill.has(skillId));
        const hasSomeSkills =
          requiredSkillIds.length > 0 &&
          requiredSkillIds.some((skillId) => userLevelBySkill.has(skillId));

        return {
          id: transition.id,
          type: transition.type,
          fromPositionId: transition.fromPositionId,
          toPositionId: transition.toPositionId,
          requiredSkills: requiredSkillsList,
          isRecommended: hasAllSkills,
          isPartiallyAvailable: hasSomeSkills && !hasAllSkills,
          readinessPercent: readiness.readinessPercent,
          missingSkills: readiness.missingSkills,
          partialSkills: readiness.partialSkills,
          okSkills: readiness.okSkills,
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

    let userLevelBySkill = new Map<string, number>();
    if (userId) {
      const userSkillsData = await prisma.userSkill.findMany({
        where: { userId },
        select: { skillId: true, level: true },
      });
      userLevelBySkill = new Map(
        userSkillsData.map((us) => [us.skillId, us.level]),
      );
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
        const requiredSkillsList = transition.requiredSkills.map((skill) => ({
          id: skill.id,
          name: skill.name,
          category: skill.category,
        }));
        const readiness = this.computeTransitionReadiness(
          requiredSkillsList,
          userLevelBySkill,
        );
        const requiredSkillIds = transition.requiredSkills.map((s) => s.id);
        const hasAllSkills =
          requiredSkillIds.length === 0 ||
          requiredSkillIds.every((skillId) => userLevelBySkill.has(skillId));
        const hasSomeSkills =
          requiredSkillIds.length > 0 &&
          requiredSkillIds.some((skillId) => userLevelBySkill.has(skillId));

        return {
          id: transition.id,
          type: transition.type,
          fromPositionId: transition.fromPositionId,
          toPositionId: transition.toPositionId,
          toPosition: {
            id: transition.toPosition.id,
            title: transition.toPosition.title,
            level: transition.toPosition.level,
            department: transition.toPosition.department,
          },
          requiredSkills: requiredSkillsList,
          isRecommended: hasAllSkills,
          isPartiallyAvailable: hasSomeSkills && !hasAllSkills,
          readinessPercent: readiness.readinessPercent,
          missingSkills: readiness.missingSkills,
          partialSkills: readiness.partialSkills,
          okSkills: readiness.okSkills,
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
