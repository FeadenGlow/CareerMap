import type { CareerScenarioType } from './types';

export const DEFAULT_SCENARIO_THEMES: Record<
  CareerScenarioType,
  { accent: string; highlight: string }
> = {
  FAST_GROWTH: { accent: '#22c55e', highlight: '#84cc16' },
  EXPERT_PATH: { accent: '#3b82f6', highlight: '#8b5cf6' },
  MANAGER_PATH: { accent: '#f97316', highlight: '#f59e0b' },
};
