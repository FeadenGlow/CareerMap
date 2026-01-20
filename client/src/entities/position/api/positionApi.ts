import { apiClient } from '@shared/api/client';
import type { Position, CreatePositionDto, UpdatePositionDto } from '../types';

export const positionApi = {
  getAll: (): Promise<Position[]> => apiClient.get('/positions'),
  getById: (id: string): Promise<Position> => apiClient.get(`/positions/${id}`),
  create: (data: CreatePositionDto): Promise<Position> => apiClient.post('/positions', data),
  update: (id: string, data: UpdatePositionDto): Promise<Position> => apiClient.patch(`/positions/${id}`, data),
  delete: (id: string): Promise<void> => apiClient.delete(`/positions/${id}`),
};

