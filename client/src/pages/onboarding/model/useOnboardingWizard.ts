import { useEffect, useState, useCallback } from 'react';
import { useOnboarding } from '@app/providers/OnboardingProvider';
import { onboardingApi } from '@features/onboarding/api/onboardingApi';
import { positionApi } from '@entities/position/api/positionApi';
import type { Position } from '@entities/position/types';
import type { InterestType, GrowthType } from '@features/onboarding/types';
import { extractErrorMessage } from '@shared/lib/extractErrorMessage';

const STEPS = 3;

export function useOnboardingWizard() {
  const { onboardingState, setOnboardingStateFromResponse } = useOnboarding();

  const [step, setStep] = useState(1);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPositionId, setCurrentPositionId] = useState<string>('');
  const [interests, setInterests] = useState<InterestType[]>([]);
  const [growthType, setGrowthType] = useState<GrowthType | ''>('');

  useEffect(() => {
    if (onboardingState?.preferences) {
      const p = onboardingState.preferences;
      if (p.currentPositionId) setCurrentPositionId(p.currentPositionId);
      if (p.interests?.length) setInterests(p.interests as InterestType[]);
      if (p.growthType) setGrowthType(p.growthType);
    }
  }, [onboardingState]);

  useEffect(() => {
    if (onboardingState?.preferences) return;
    const loadFullState = async () => {
      try {
        const state = await onboardingApi.getState();
        setOnboardingStateFromResponse(state);
      } catch {
        // Keep current state; wizard works with defaults
      }
    };
    loadFullState();
  }, [onboardingState?.preferences, setOnboardingStateFromResponse]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await positionApi.getAll();
        setPositions(data);
      } catch {
        setError('Failed to load positions');
      } finally {
        setLoadingPositions(false);
      }
    };
    load();
  }, []);

  const toggleInterest = useCallback((value: InterestType) => {
    setInterests((prev) =>
      prev.includes(value)
        ? prev.filter((i) => i !== value)
        : prev.length < 3
          ? [...prev, value]
          : prev,
    );
  }, []);

  const saveProgress = useCallback(
    async (nextStep: number) => {
      setError(null);
      setSaving(true);
      try {
        await onboardingApi.saveProgress({
          currentPositionId: currentPositionId || undefined,
          interests: interests.length ? interests : undefined,
          growthType: growthType || undefined,
          lastStep: nextStep,
        });
        setStep(nextStep);
      } catch (err: unknown) {
        setError(extractErrorMessage(err, 'Failed to save progress'));
      } finally {
        setSaving(false);
      }
    },
    [currentPositionId, interests, growthType],
  );

  const handleNext = useCallback(() => {
    if (step < STEPS) {
      saveProgress(step + 1);
    }
  }, [step, saveProgress]);

  const handleComplete = useCallback(
    async (onSuccess: () => void) => {
      if (!currentPositionId || interests.length === 0 || !growthType) return;
      setError(null);
      setSaving(true);
      try {
        const newState = await onboardingApi.complete({
          currentPositionId,
          interests,
          growthType: growthType as GrowthType,
        });
        setOnboardingStateFromResponse(newState);
        onSuccess();
      } catch (err: unknown) {
        setError(extractErrorMessage(err, 'Failed to complete onboarding'));
      } finally {
        setSaving(false);
      }
    },
    [currentPositionId, interests, growthType, setOnboardingStateFromResponse],
  );

  const step1Valid = !!currentPositionId;
  const step2Valid = interests.length >= 1 && interests.length <= 3;
  const step3Valid = !!growthType;
  const canNext =
    (step === 1 && step1Valid) ||
    (step === 2 && step2Valid) ||
    (step === 3 && step3Valid);

  return {
    step,
    setStep,
    totalSteps: STEPS,
    positions,
    loadingPositions,
    error,
    setError,
    currentPositionId,
    setCurrentPositionId,
    interests,
    growthType,
    setGrowthType,
    saving,
    toggleInterest,
    saveProgress,
    handleNext,
    handleComplete,
    step1Valid,
    step2Valid,
    step3Valid,
    canNext,
  };
}
