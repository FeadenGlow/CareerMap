import { apiClient } from '@shared/api/client';
import type { Transition, CreateTransitionDto, UpdateTransitionDto } from '../types';

export const transitionApi = {
  getAll: (): Promise<Transition[]> => apiClient.get('/transitions'),
  getById: (id: string): Promise<Transition> => apiClient.get(`/transitions/${id}`),
  create: (data: CreateTransitionDto): Promise<Transition> => apiClient.post('/transitions', data),
  update: (id: string, data: UpdateTransitionDto): Promise<Transition> => apiClient.patch(`/transitions/${id}`, data),
  delete: (id: string): Promise<void> => apiClient.delete(`/transitions/${id}`),
};

