import type { DevelopmentGoal } from '@entities/development/types';
import type { Position } from '@entities/position/types';
import { Card } from '@shared/ui/Card';
import { Button } from '@shared/ui/Button';

interface GoalSectionProps {
  goal: DevelopmentGoal | null;
  selectedGoalId: string;
  onSelectedGoalIdChange: (id: string) => void;
  positions: Position[];
  onSave: () => void;
  saving: boolean;
}

export function GoalSection({
  goal,
  selectedGoalId,
  onSelectedGoalIdChange,
  positions,
  onSave,
  saving,
}: GoalSectionProps) {
  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Goal</h2>
      {goal ? (
        <p className="text-gray-700 mb-4">
          Current goal: {goal.targetPosition?.title ?? goal.targetPositionId}
        </p>
      ) : (
        <p className="text-gray-500 mb-4">No goal set</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedGoalId}
          onChange={(e) => onSelectedGoalIdChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 min-w-[200px]"
        >
          <option value="">Select position</option>
          {positions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} (L{p.level}) — {p.department}
            </option>
          ))}
        </select>
        <Button onClick={onSave} disabled={saving || !selectedGoalId}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </Card>
  );
}
