import { apiClient } from '@shared/api/client';
import type { Skill, CreateSkillDto, UpdateSkillDto } from '../types';

export const skillApi = {
  getAll: (): Promise<Skill[]> => apiClient.get('/skills'),
  getById: (id: string): Promise<Skill> => apiClient.get(`/skills/${id}`),
  create: (data: CreateSkillDto): Promise<Skill> => apiClient.post('/skills', data),
  update: (id: string, data: UpdateSkillDto): Promise<Skill> => apiClient.patch(`/skills/${id}`, data),
  delete: (id: string): Promise<void> => apiClient.delete(`/skills/${id}`),
};

