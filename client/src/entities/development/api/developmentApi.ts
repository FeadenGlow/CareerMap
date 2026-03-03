import { apiClient } from '@shared/api/client';
import type { DevelopmentProfile, DevelopmentGoal } from '../types';

export const developmentApi = {
  getProfile: (): Promise<DevelopmentProfile> =>
    apiClient.get('/development/profile'),
  getGoal: (): Promise<DevelopmentGoal | null> =>
    apiClient.get('/development/goal'),
  setGoal: (targetPositionId: string): Promise<DevelopmentGoal> =>
    apiClient.put('/development/goal', { targetPositionId }),
};
