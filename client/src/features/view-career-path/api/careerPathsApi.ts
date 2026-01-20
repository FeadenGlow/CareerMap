import { apiClient } from '@shared/api/client';
import type { Position } from '@entities/position/types';
import type { Transition } from '@entities/transition/types';

export interface CareerGraph {
  positions: Position[];
  transitions: Transition[];
}

export interface CareerPathsFromPosition {
  fromPosition: Position;
  directTransitions: Transition[];
  reachablePositions: Position[];
}

export const careerPathsApi = {
  getCareerGraph: (): Promise<CareerGraph> => apiClient.get('/career-paths'),
  getCareerPathsFromPosition: (positionId: string): Promise<CareerPathsFromPosition> =>
    apiClient.get(`/career-paths/from/${positionId}`),
};

