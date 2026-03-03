export interface DevelopmentGoal {
  targetPositionId: string;
  targetPosition?: {
    id: string;
    title: string;
    level: number;
    department: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type SkillGapStatus = 'missing' | 'partial' | 'ok';

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  status: SkillGapStatus;
  userLevel?: number;
  requiredLevel: number;
}

export type GapReason = 'noGoal' | 'noStartPosition' | 'pathNotFound' | null;

export interface DevelopmentProfile {
  userSkills: Array<{
    skillId: string;
    skillName: string;
    category: string | null;
    level: number;
  }>;
  goal: DevelopmentGoal | null;
  skillGaps: SkillGapItem[];
  gapReason: GapReason;
  readiness: number | null;
}
