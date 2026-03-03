import { apiClient } from '@shared/api/client';
import type { User, UserSkillWithLevel, PutSkillsBody } from '../types';

export const userApi = {
  getProfile: (): Promise<User> => apiClient.get('/users/profile'),
  updateProfile: (data: { email?: string }): Promise<User> =>
    apiClient.put('/users/profile', data),
  updateUserPosition: (userId: string, positionId: string): Promise<User> =>
    apiClient.put(`/users/${userId}/position`, { positionId }),
  getSkills: (): Promise<UserSkillWithLevel[]> =>
    apiClient.get('/users/profile/skills'),
  putSkills: (body: PutSkillsBody): Promise<UserSkillWithLevel[]> =>
    apiClient.put('/users/profile/skills', body),
  addSkill: (skillId: string, level?: number): Promise<UserSkillWithLevel[]> =>
    apiClient.post('/users/profile/skills', { skillId, level }),
  updateSkillLevel: (
    skillId: string,
    level: number,
  ): Promise<UserSkillWithLevel[]> =>
    apiClient.patch(`/users/profile/skills/${skillId}`, { level }),
  deleteSkill: (skillId: string): Promise<UserSkillWithLevel[]> =>
    apiClient.delete(`/users/profile/skills/${skillId}`),
};
