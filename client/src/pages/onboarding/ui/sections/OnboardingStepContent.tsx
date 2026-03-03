import type { Position } from '@entities/position/types';
import type { InterestType, GrowthType } from '@features/onboarding/types';
import { INTEREST_TYPES, GROWTH_TYPES } from '@features/onboarding/types';
import { LoadingSpinner } from '@shared/ui/LoadingSpinner';
import { ErrorMessage } from '@shared/ui/ErrorMessage';

interface OnboardingStepContentProps {
  step: number;
  positions: Position[];
  loadingPositions: boolean;
  currentPositionId: string;
  onPositionChange: (positionId: string) => void;
  interests: InterestType[];
  onToggleInterest: (value: InterestType) => void;
  growthType: GrowthType | '';
  onGrowthTypeChange: (value: GrowthType) => void;
  error: string | null;
}

export function OnboardingStepContent({
  step,
  positions,
  loadingPositions,
  currentPositionId,
  onPositionChange,
  interests,
  onToggleInterest,
  growthType,
  onGrowthTypeChange,
  error,
}: OnboardingStepContentProps) {
  return (
    <>
      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {step === 1 && (
        <>
          <h2 className="text-lg font-semibold mb-4">
            What is your current position?
          </h2>
          {loadingPositions ? (
            <LoadingSpinner />
          ) : (
            <select
              className="w-full border rounded px-3 py-2"
              value={currentPositionId}
              onChange={(e) => onPositionChange(e.target.value)}
            >
              <option value="">Select position</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.department}, level {p.level})
                </option>
              ))}
            </select>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-lg font-semibold mb-4">
            Select your interests (1–3)
          </h2>
          <div className="space-y-2">
            {INTEREST_TYPES.map((value) => (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={interests.includes(value)}
                  onChange={() => onToggleInterest(value)}
                />
                <span>{value}</span>
              </label>
            ))}
          </div>
          {interests.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {interests.join(', ')}
            </p>
          )}
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-lg font-semibold mb-4">
            What type of growth do you want?
          </h2>
          <div className="space-y-2">
            {GROWTH_TYPES.map((value) => (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="growthType"
                  checked={growthType === value}
                  onChange={() => onGrowthTypeChange(value)}
                />
                <span>{value}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </>
  );
}
