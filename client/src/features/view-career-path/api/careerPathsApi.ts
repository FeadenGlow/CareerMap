import { apiClient } from '@shared/api/client';
import type { Position } from '@entities/position/types';
import type { Transition } from '@entities/transition/types';
import type { CareerScenarioType } from '@features/career-scenarios/types';

export interface CareerGraph {
  positions: Position[];
  transitions: Transition[];
}

export interface CareerPathsFromPosition {
  fromPosition: Position;
  directTransitions: Transition[];
  reachablePositions: Position[];
}

export type RecommendationReason =
  | 'noStartPosition'
  | 'noGraphData'
  | 'noTargets'
  | 'noPaths'
  | 'ok';

export interface RecommendationItem {
  targetPosition: {
    id: string;
    title: string;
    level: number;
    department: string;
  };
  transitions: Array<{
    id: string;
    fromPositionId: string;
    toPositionId: string;
    type: string;
  }>;
  scores: {
    reachability: number;
    difficulty: number;
    timeCost: number;
    interestFit: number;
    overall: number;
  };
  explanation: {
    topMissingSkills: Array<{
      id: string;
      name: string;
      deficitPercent?: number;
    }>;
    topContributors: Array<{
      id: string;
      name: string;
      deficitPercent?: number;
    }>;
    notes: string[];
  };
}

export interface CareerRecommendationsResponse {
  startPositionId: string | null;
  reason: RecommendationReason;
  recommendations: RecommendationItem[];
}

export interface GetRecommendationsParams {
  limit?: number;
  maxDepth?: number;
  targetPositionId?: string;
  scenario?: CareerScenarioType;
}

export const careerPathsApi = {
  getCareerGraph: (): Promise<CareerGraph> => apiClient.get('/career-paths'),
  getCareerPathsFromPosition: (
    positionId: string,
  ): Promise<CareerPathsFromPosition> =>
    apiClient.get(`/career-paths/from/${positionId}`),
  getRecommendations: (
    params?: GetRecommendationsParams,
  ): Promise<CareerRecommendationsResponse> =>
    apiClient.get('/career-recommendations', { params }),
};
