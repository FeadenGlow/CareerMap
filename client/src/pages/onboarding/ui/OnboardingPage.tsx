import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/config/routes';
import { useOnboarding } from '@app/providers/OnboardingProvider';
import { Card } from '@shared/ui/Card';
import { LoadingSpinner } from '@shared/ui/LoadingSpinner';
import { useOnboardingWizard } from '../model/useOnboardingWizard';
import { OnboardingStepIndicator } from './sections/OnboardingStepIndicator';
import { OnboardingStepContent } from './sections/OnboardingStepContent';
import { OnboardingStepNav } from './sections/OnboardingStepNav';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { onboardingLoading } = useOnboarding();
  const wizard = useOnboardingWizard();

  if (onboardingLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <OnboardingStepIndicator
          step={wizard.step}
          totalSteps={wizard.totalSteps}
        />

        <Card>
          <OnboardingStepContent
            step={wizard.step}
            positions={wizard.positions}
            loadingPositions={wizard.loadingPositions}
            currentPositionId={wizard.currentPositionId}
            onPositionChange={wizard.setCurrentPositionId}
            interests={wizard.interests}
            onToggleInterest={wizard.toggleInterest}
            growthType={wizard.growthType}
            onGrowthTypeChange={wizard.setGrowthType}
            error={wizard.error}
          />

          <OnboardingStepNav
            step={wizard.step}
            totalSteps={wizard.totalSteps}
            canGoBack={wizard.step > 1}
            onBack={() => wizard.setStep(wizard.step - 1)}
            canNext={wizard.canNext}
            onNext={wizard.handleNext}
            canFinish={
              wizard.step3Valid &&
              wizard.step1Valid &&
              wizard.step2Valid
            }
            onFinish={() =>
              wizard.handleComplete(() =>
                navigate(ROUTES.CAREER_PATHS, { replace: true }),
              )
            }
            saving={wizard.saving}
          />
        </Card>
      </div>
    </div>
  );
}
