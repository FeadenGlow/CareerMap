import type { Skill } from '@entities/skill/types';

export type OnboardingStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  role: 'EMPLOYEE' | 'HR' | 'ADMIN';
  positionId?: string | null;
  onboardingStatus?: OnboardingStatus;
  position?: {
    id: string;
    title: string;
    level: number;
    department: string;
  };
  currentPositionId?: string | null;
  interests?: string[];
  growthType?: string | null;
  currentPosition?: {
    id: string;
    title: string;
    level: number;
    department: string;
  } | null;
}

export interface UserSkillWithLevel {
  skillId: string;
  skill: Skill;
  level: number;
}

export interface PutSkillsBody {
  skills: Array<{ skillId: string; level: number }>;
}
