import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '../../config/prisma';
import { SKILL_SUFFICIENT_LEVEL } from '../../config/development.constants';

export type SkillGapStatus = 'missing' | 'partial' | 'ok';

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  status: SkillGapStatus;
  userLevel?: number;
  requiredLevel: number;
}

export interface DevelopmentGoalDto {
  targetPositionId: string;
  targetPosition?: {
    id: string;
    title: string;
    level: number;
    department: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type GapReason = 'noGoal' | 'noStartPosition' | 'pathNotFound' | null;

export interface DevelopmentProfileDto {
  userSkills: Array<{
    skillId: string;
    skillName: string;
    category: string | null;
    level: number;
  }>;
  goal: DevelopmentGoalDto | null;
  skillGaps: SkillGapItem[];
  gapReason: GapReason;
  readiness: number | null;
}

interface TransitionWithSkills {
  id: string;
  fromPositionId: string;
  toPositionId: string;
  requiredSkills: Array<{ id: string; name: string; category: string | null }>;
}

@Injectable()
export class DevelopmentService {
  async getGoal(userId: string): Promise<DevelopmentGoalDto | null> {
    const goal = await prisma.userDevelopmentGoal.findUnique({
      where: { userId },
      include: {
        targetPosition: true,
      },
    });

    if (!goal) return null;

    return {
      targetPositionId: goal.targetPositionId,
      targetPosition: goal.targetPosition
        ? {
            id: goal.targetPosition.id,
            title: goal.targetPosition.title,
            level: goal.targetPosition.level,
            department: goal.targetPosition.department,
          }
        : undefined,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }

  async setGoal(
    userId: string,
    targetPositionId: string,
  ): Promise<DevelopmentGoalDto> {
    const position = await prisma.position.findUnique({
      where: { id: targetPositionId },
    });
    if (!position) {
      throw new NotFoundException('Position not found');
    }

    const goal = await prisma.userDevelopmentGoal.upsert({
      where: { userId },
      create: { userId, targetPositionId },
      update: { targetPositionId },
      include: { targetPosition: true },
    });

    return {
      targetPositionId: goal.targetPositionId,
      targetPosition: goal.targetPosition
        ? {
            id: goal.targetPosition.id,
            title: goal.targetPosition.title,
            level: goal.targetPosition.level,
            department: goal.targetPosition.department,
          }
        : undefined,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }

  async getDevelopmentProfile(userId: string): Promise<DevelopmentProfileDto> {
    const [user, userSkillsData, goal] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          positionId: true,
          currentPositionId: true,
        },
      }),
      prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true },
      }),
      prisma.userDevelopmentGoal.findUnique({
        where: { userId },
        include: { targetPosition: true },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userSkills = userSkillsData.map((us) => ({
      skillId: us.skillId,
      skillName: us.skill.name,
      category: us.skill.category,
      level: us.level,
    }));

    const goalDto: DevelopmentGoalDto | null = goal
      ? {
          targetPositionId: goal.targetPositionId,
          targetPosition: goal.targetPosition
            ? {
                id: goal.targetPosition.id,
                title: goal.targetPosition.title,
                level: goal.targetPosition.level,
                department: goal.targetPosition.department,
              }
            : undefined,
          createdAt: goal.createdAt,
          updatedAt: goal.updatedAt,
        }
      : null;

    const startPositionId = user.positionId ?? user.currentPositionId;

    if (!goal) {
      return {
        userSkills,
        goal: goalDto,
        skillGaps: [],
        gapReason: 'noGoal',
        readiness: null,
      };
    }

    if (!startPositionId) {
      return {
        userSkills,
        goal: goalDto,
        skillGaps: [],
        gapReason: 'noStartPosition',
        readiness: null,
      };
    }

    const path = await this.findShortestPath(
      startPositionId,
      goal.targetPositionId,
    );

    if (!path || path.length === 0) {
      const isSamePosition = startPositionId === goal.targetPositionId;
      return {
        userSkills,
        goal: goalDto,
        skillGaps: isSamePosition ? [] : [],
        gapReason: isSamePosition ? null : 'pathNotFound',
        readiness: isSamePosition ? null : null,
      };
    }

    const requiredBySkill = new Map<
      string,
      { name: string; category: string | null; requiredLevel: number }
    >();
    for (const t of path) {
      for (const skill of t.requiredSkills) {
        const level = SKILL_SUFFICIENT_LEVEL;
        const existing = requiredBySkill.get(skill.id);
        const requiredLevel = Math.max(existing?.requiredLevel ?? 0, level);
        requiredBySkill.set(skill.id, {
          name: skill.name,
          category: skill.category,
          requiredLevel,
        });
      }
    }

    const userLevelBySkill = new Map(
      userSkillsData.map((us) => [us.skillId, us.level]),
    );

    const skillGaps: SkillGapItem[] = [];
    for (const [skillId, meta] of requiredBySkill) {
      const userLevel = userLevelBySkill.get(skillId);
      const requiredLevel = meta.requiredLevel;
      let status: SkillGapStatus = 'missing';
      if (userLevel !== undefined) {
        status = userLevel >= requiredLevel ? 'ok' : 'partial';
      }
      skillGaps.push({
        skillId,
        skillName: meta.name,
        status,
        userLevel,
        requiredLevel,
      });
    }

    const totalRequired = skillGaps.length;
    const okCount = skillGaps.filter((g) => g.status === 'ok').length;
    const readiness =
      totalRequired > 0 ? Math.floor((okCount / totalRequired) * 100) : null;

    return {
      userSkills,
      goal: goalDto,
      skillGaps,
      gapReason: null,
      readiness,
    };
  }

  private async findShortestPath(
    fromPositionId: string,
    toPositionId: string,
  ): Promise<TransitionWithSkills[] | null> {
    if (fromPositionId === toPositionId) {
      return [];
    }

    const transitions = await prisma.transition.findMany({
      include: {
        requiredSkills: true,
      },
    });

    const byFrom = new Map<string, TransitionWithSkills[]>();
    for (const t of transitions) {
      const list = byFrom.get(t.fromPositionId) ?? [];
      list.push({
        id: t.id,
        fromPositionId: t.fromPositionId,
        toPositionId: t.toPositionId,
        requiredSkills: t.requiredSkills.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
        })),
      });
      byFrom.set(t.fromPositionId, list);
    }

    const parent = new Map<
      string,
      { fromPositionId: string; transition: TransitionWithSkills }
    >();
    const queue: string[] = [fromPositionId];
    const visited = new Set<string>([fromPositionId]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === toPositionId) break;

      const nextTransitions = byFrom.get(current) ?? [];
      for (const t of nextTransitions) {
        if (visited.has(t.toPositionId)) continue;
        visited.add(t.toPositionId);
        parent.set(t.toPositionId, { fromPositionId: current, transition: t });
        queue.push(t.toPositionId);
      }
    }

    const path: TransitionWithSkills[] = [];
    let cur: string | undefined = toPositionId;
    while (cur) {
      const p = parent.get(cur);
      if (!p) break;
      path.unshift(p.transition);
      cur = p.fromPositionId === fromPositionId ? undefined : p.fromPositionId;
    }

    if (path.length === 0 && fromPositionId !== toPositionId) {
      return null;
    }
    return path;
  }
}
