export type CareerScenarioType = 'FAST_GROWTH' | 'EXPERT_PATH' | 'MANAGER_PATH';

export const CareerScenarioTypeEnum: Record<
  CareerScenarioType,
  CareerScenarioType
> = {
  FAST_GROWTH: 'FAST_GROWTH',
  EXPERT_PATH: 'EXPERT_PATH',
  MANAGER_PATH: 'MANAGER_PATH',
};

export interface ScenarioWeights {
  W_REACHABILITY: number;
  W_TIME: number;
  W_DIFFICULTY: number;
  W_INTEREST: number;
}

export const SCENARIO_WEIGHTS: Record<CareerScenarioType, ScenarioWeights> = {
  FAST_GROWTH: {
    W_REACHABILITY: 0.5,
    W_TIME: 0.25,
    W_DIFFICULTY: 0.15,
    W_INTEREST: 0.1,
  },
  EXPERT_PATH: {
    W_REACHABILITY: 0.4,
    W_TIME: 0.15,
    W_DIFFICULTY: 0.35,
    W_INTEREST: 0.1,
  },
  MANAGER_PATH: {
    W_REACHABILITY: 0.35,
    W_TIME: 0.15,
    W_DIFFICULTY: 0.15,
    W_INTEREST: 0.35,
  },
};

export const BONUS_VERTICAL_PER_EDGE = 0.02;
export const PENALTY_CHANGE_PER_EDGE = 0.03;
export const MANAGER_BONUS_IF_TARGET_MGMT = 0.08;
export const MANAGER_BONUS_IF_EDGE_TO_MGMT = 0.02;

const MANAGEMENT_TITLE_KEYWORDS = ['manager', 'lead', 'head', 'leadership'];

export function isManagementTarget(department: string, title: string): boolean {
  const d = department.toLowerCase();
  if (
    d.includes('management') ||
    d.includes('leadership') ||
    d.includes('lead')
  ) {
    return true;
  }
  const t = title.toLowerCase();
  return MANAGEMENT_TITLE_KEYWORDS.some((k) => t.includes(k));
}

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

export const SCENARIOS: ScenarioInfo[] = [
  {
    type: 'FAST_GROWTH',
    title: 'Fast Growth',
    description:
      'Focus on reaching the next level or role as quickly as possible, even if the path is harder.',
    theme: { accent: '#22c55e', highlight: '#84cc16' },
  },
  {
    type: 'EXPERT_PATH',
    title: 'Expert Path',
    description:
      'Deepening technical and professional skills, quality and stability, fewer sharp jumps.',
    theme: { accent: '#3b82f6', highlight: '#8b5cf6' },
  },
  {
    type: 'MANAGER_PATH',
    title: 'Manager Path',
    description:
      'Management trajectories, leadership and communication, transitions into management.',
    theme: { accent: '#f97316', highlight: '#f59e0b' },
  },
];

export const SCENARIO_MAX_DEPTH_OFFSET: Partial<
  Record<CareerScenarioType, number>
> = {
  EXPERT_PATH: 1,
};
