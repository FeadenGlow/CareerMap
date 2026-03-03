import type { DevelopmentProfile } from '@entities/development/types';
import { Card } from '@shared/ui/Card';

interface SkillGapsSectionProps {
  profile: DevelopmentProfile | null;
}

export function SkillGapsSection({ profile }: SkillGapsSectionProps) {
  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Skill gaps</h2>
      {profile?.gapReason === 'noGoal' && (
        <p className="text-gray-600">Set a goal to see skill gaps</p>
      )}
      {profile?.gapReason === 'noStartPosition' && (
        <p className="text-gray-600">
          Set your current/assigned position in Profile or onboarding to see
          skill gaps.
        </p>
      )}
      {profile?.gapReason === 'pathNotFound' && profile?.goal && (
        <p className="text-gray-600">
          No transition path found from your current position to goal.
        </p>
      )}
      {profile?.gapReason === null &&
        profile?.skillGaps?.length === 0 &&
        profile?.goal && (
          <p className="text-gray-600">
            No skill gaps — you meet the requirements on the path.
          </p>
        )}
      {profile?.gapReason === null &&
        profile?.skillGaps &&
        profile.skillGaps.length > 0 && (
          <>
            {profile.readiness !== null && (
              <p className="text-sm text-gray-600 mb-4">
                Readiness: {profile.readiness}%
              </p>
            )}
            <ul className="space-y-3">
              {profile.skillGaps.map((gap) => (
                <li
                  key={gap.skillId}
                  className={`rounded-lg px-4 py-3 border ${
                    gap.status === 'missing'
                      ? 'bg-red-50 border-red-200'
                      : gap.status === 'partial'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {gap.skillName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {gap.status === 'missing'
                          ? 'Missing'
                          : gap.status === 'partial'
                            ? 'Needs improvement'
                            : 'OK'}
                        {gap.userLevel !== undefined && (
                          <>
                            {' '}
                            — You: {gap.userLevel}% / Required:{' '}
                            {gap.requiredLevel}%
                          </>
                        )}
                        {gap.status === 'missing' && (
                          <> — Required: {gap.requiredLevel}%</>
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
    </Card>
  );
}
