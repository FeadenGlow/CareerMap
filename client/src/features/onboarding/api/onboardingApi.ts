import { apiClient } from '@shared/api/client';
import type {
  OnboardingState,
  OnboardingProgressDto,
  OnboardingCompleteDto,
} from '../types';

export const onboardingApi = {
  getState: (): Promise<OnboardingState> => apiClient.get('/onboarding'),

  start: (): Promise<OnboardingState> =>
    apiClient.post('/onboarding/start', {}),

  saveProgress: (dto: OnboardingProgressDto): Promise<OnboardingState> =>
    apiClient.patch('/onboarding/progress', dto),

  complete: (dto: OnboardingCompleteDto): Promise<OnboardingState> =>
    apiClient.post('/onboarding/complete', dto),
};
