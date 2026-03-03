import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthProvider';
import { userApi } from '@entities/user/api/userApi';
import type { OnboardingState } from '@features/onboarding/types';
import {
  ONBOARDING_STATUS_DEFAULT,
  ONBOARDING_STATUS_COMPLETED,
} from '@features/onboarding/types';

const ONBOARDING_HINT_KEY = 'onboardingCompletedHint';

interface OnboardingContextType {
  onboardingCompleted: boolean;
  onboardingLoading: boolean;
  onboardingState: OnboardingState | null;
  refetchOnboarding: () => Promise<void>;
  setOnboardingStateFromResponse: (state: OnboardingState) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [onboardingState, setOnboardingState] =
    useState<OnboardingState | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(true);

  const fetchStatusFromProfile = useCallback(async () => {
    if (!user) {
      setOnboardingState(null);
      return;
    }
    try {
      setOnboardingLoading(true);
      const profile = await userApi.getProfile();
      const status =
        profile.onboardingStatus ?? ONBOARDING_STATUS_DEFAULT;
      setOnboardingState((prev) => ({
        status,
        startedAt: prev?.startedAt ?? new Date().toISOString(),
        completedAt: prev?.completedAt ?? null,
        lastStep: prev?.lastStep ?? null,
        version: prev?.version ?? null,
        preferences: prev?.preferences ?? {
          currentPositionId: null,
          interests: [],
          growthType: null,
          currentPosition: null,
        },
      }));
      if (status === ONBOARDING_STATUS_COMPLETED) {
        localStorage.setItem(ONBOARDING_HINT_KEY, 'true');
      } else {
        localStorage.removeItem(ONBOARDING_HINT_KEY);
      }
    } catch {
      setOnboardingState(null);
      localStorage.removeItem(ONBOARDING_HINT_KEY);
    } finally {
      setOnboardingLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setOnboardingState(null);
      setOnboardingLoading(false);
      localStorage.removeItem(ONBOARDING_HINT_KEY);
      return;
    }
    fetchStatusFromProfile();
  }, [authLoading, user, fetchStatusFromProfile]);

  const onboardingCompleted =
    onboardingState?.status === ONBOARDING_STATUS_COMPLETED;

  const refetchOnboarding = useCallback(async () => {
    await fetchStatusFromProfile();
  }, [fetchStatusFromProfile]);

  const setOnboardingStateFromResponse = useCallback(
    (state: OnboardingState) => {
      setOnboardingState(state);
      if (state.status === ONBOARDING_STATUS_COMPLETED) {
        localStorage.setItem(ONBOARDING_HINT_KEY, 'true');
      } else {
        localStorage.removeItem(ONBOARDING_HINT_KEY);
      }
    },
    [],
  );

  const value: OnboardingContextType = {
    onboardingCompleted,
    onboardingLoading,
    onboardingState,
    refetchOnboarding,
    setOnboardingStateFromResponse,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
