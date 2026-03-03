import { apiClient } from '@shared/api/client';
import type { CareerScenarioType, ScenariosResponse } from '../types';

export const careerScenariosApi = {
  getScenarios: (): Promise<ScenariosResponse> =>
    apiClient.get('/career-scenarios'),

  setActiveScenario: (
    scenario: CareerScenarioType,
  ): Promise<{ activeScenario: CareerScenarioType }> =>
    apiClient.put('/career-scenarios/active', { scenario }),
};
