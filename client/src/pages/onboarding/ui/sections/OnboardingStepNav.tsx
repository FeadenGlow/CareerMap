import { Button } from '@shared/ui/Button';

interface OnboardingStepNavProps {
  step: number;
  totalSteps: number;
  canGoBack: boolean;
  onBack: () => void;
  canNext: boolean;
  onNext: () => void;
  canFinish: boolean;
  onFinish: () => void;
  saving: boolean;
}

export function OnboardingStepNav({
  step,
  totalSteps,
  canGoBack,
  onBack,
  canNext,
  onNext,
  canFinish,
  onFinish,
  saving,
}: OnboardingStepNavProps) {
  return (
    <div className="mt-8 flex justify-between">
      {canGoBack ? (
        <Button
          variant="secondary"
          onClick={onBack}
          disabled={saving}
        >
          Back
        </Button>
      ) : (
        <div />
      )}
      {step < totalSteps ? (
        <Button onClick={onNext} disabled={!canNext || saving}>
          {saving ? 'Saving...' : 'Next'}
        </Button>
      ) : (
        <Button
          onClick={onFinish}
          disabled={!canFinish || saving}
        >
          {saving ? 'Saving...' : 'Finish'}
        </Button>
      )}
    </div>
  );
}
