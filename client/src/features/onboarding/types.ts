export const INTEREST_TYPES = ['DEV', 'MANAGEMENT', 'DATA'] as const;
export type InterestType = (typeof INTEREST_TYPES)[number];

export const GROWTH_TYPES = ['VERTICAL', 'HORIZONTAL', 'ROLE_CHANGE'] as const;
export type GrowthType = (typeof GROWTH_TYPES)[number];

export const ONBOARDING_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
] as const;
export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number];

export const ONBOARDING_STATUS_DEFAULT = 'NOT_STARTED' as const;
export const ONBOARDING_STATUS_COMPLETED = 'COMPLETED' as const;

export interface OnboardingPreferences {
  currentPositionId: string | null;
  interests: InterestType[];
  growthType: GrowthType | null;
  currentPosition: {
    id: string;
    title: string;
    level: number;
    department: string;
  } | null;
}

export interface OnboardingState {
  status: OnboardingStatus;
  startedAt: string;
  completedAt: string | null;
  lastStep: number | null;
  version: number | null;
  preferences: OnboardingPreferences;
}

export interface OnboardingProgressDto {
  currentPositionId?: string;
  interests?: InterestType[];
  growthType?: GrowthType;
  lastStep?: number;
}

export interface OnboardingCompleteDto {
  currentPositionId: string;
  interests: InterestType[];
  growthType: GrowthType;
}
