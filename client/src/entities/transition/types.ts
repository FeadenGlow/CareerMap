import type { Position } from '@entities/position/types';
import type { Skill } from '@entities/skill/types';

export type TransitionType = 'VERTICAL' | 'HORIZONTAL' | 'CHANGE';

export interface TransitionSkillWithLevel extends Skill {
  userLevel: number;
  requiredLevel?: number;
}

export interface Transition {
  id: string;
  type: TransitionType;
  fromPositionId: string;
  toPositionId: string;
  fromPosition?: Position;
  toPosition?: Position;
  requiredSkills?: Skill[];
  isRecommended?: boolean;
  isPartiallyAvailable?: boolean;
  readinessPercent?: number;
  missingSkills?: Skill[];
  partialSkills?: TransitionSkillWithLevel[];
  okSkills?: TransitionSkillWithLevel[];
}

export interface CreateTransitionDto {
  type: TransitionType;
  fromPositionId: string;
  toPositionId: string;
  requiredSkillIds?: string[];
}

export interface UpdateTransitionDto {
  type?: TransitionType;
  fromPositionId?: string;
  toPositionId?: string;
  requiredSkillIds?: string[];
}
