export type CareerScenarioType =
  | 'FAST_GROWTH'
  | 'EXPERT_PATH'
  | 'MANAGER_PATH';

export interface ScenarioTheme {
  accent: string;
  highlight: string;
}

export interface ScenarioInfo {
  type: CareerScenarioType;
  title: string;
  description: string;
  theme: ScenarioTheme;
}

export interface ScenariosResponse {
  activeScenario: CareerScenarioType;
  scenarios: ScenarioInfo[];
}
