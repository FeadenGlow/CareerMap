import type { Position } from '@entities/position/types';
import type { Skill } from '@entities/skill/types';

export type TransitionType = 'VERTICAL' | 'HORIZONTAL' | 'CHANGE';

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
  missingSkills?: string[];
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

