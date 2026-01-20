import { apiClient } from '@shared/api/client';
import type { User } from '../types';
import type { Skill } from '@entities/skill/types';

export const userApi = {
  getProfile: (): Promise<User> => apiClient.get('/users/profile'),
  updateProfile: (data: { email?: string }): Promise<User> => apiClient.put('/users/profile', data),
  updateUserPosition: (userId: string, positionId: string): Promise<User> =>
    apiClient.put(`/users/${userId}/position`, { positionId }),
  updateSkills: (skillIds: string[]): Promise<User> =>
    apiClient.put('/users/profile/skills', { skillIds }),
  getSkills: (): Promise<Skill[]> => apiClient.get('/users/profile/skills'),
};

