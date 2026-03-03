import type { DevelopmentProfile } from '@entities/development/types';
import { Card } from '@shared/ui/Card';
import { Button } from '@shared/ui/Button';

interface MySkillsSectionProps {
  userSkills: DevelopmentProfile['userSkills'];
  onLevelChange: (skillId: string, level: number) => void;
  onDelete: (skillId: string) => void;
  savingLevelSkillId: string | null;
  savedLevelSkillId: string | null;
  onAddSkill: () => void;
}

export function MySkillsSection({
  userSkills,
  onLevelChange,
  onDelete,
  savingLevelSkillId,
  savedLevelSkillId,
  onAddSkill,
}: MySkillsSectionProps) {
  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">My Skills</h2>
      {userSkills && userSkills.length > 0 ? (
        <ul className="space-y-4">
          {userSkills.map((us) => (
            <li
              key={us.skillId}
              className="flex flex-wrap items-center gap-3 py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{us.skillName}</p>
                {us.category && (
                  <p className="text-xs text-gray-500">{us.category}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded"
                    style={{ width: `${us.level}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{us.level}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={us.level}
                  onChange={(e) =>
                    onLevelChange(us.skillId, parseInt(e.target.value, 10) || 0)
                  }
                  className="w-14 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <span className="text-xs text-gray-500 w-16">
                  {savingLevelSkillId === us.skillId
                    ? 'Saving…'
                    : savedLevelSkillId === us.skillId
                      ? 'Saved'
                      : ''}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => onDelete(us.skillId)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mb-4">No skills added yet.</p>
      )}
      <Button variant="secondary" onClick={onAddSkill} className="mt-4">
        Add skill
      </Button>
    </Card>
  );
}
