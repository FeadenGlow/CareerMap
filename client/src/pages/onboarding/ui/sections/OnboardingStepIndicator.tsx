interface OnboardingStepIndicatorProps {
  step: number;
  totalSteps: number;
}

export function OnboardingStepIndicator({
  step,
  totalSteps,
}: OnboardingStepIndicatorProps) {
  return (
    <>
      <div className="mb-6 text-center text-sm text-gray-600">
        Step {step} of {totalSteps}
      </div>
      <div className="flex gap-2 justify-center mb-8">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded ${
              s <= step ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </>
  );
}
