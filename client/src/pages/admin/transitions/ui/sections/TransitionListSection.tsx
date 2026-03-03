import type { Transition } from '@entities/transition/types';
import { Card } from '@shared/ui/Card';
import { Button } from '@shared/ui/Button';

interface TransitionListSectionProps {
  transitions: Transition[];
  onEdit: (transition: Transition) => void;
  onDelete: (id: string) => void;
}

export function TransitionListSection({
  transitions,
  onEdit,
  onDelete,
}: TransitionListSectionProps) {
  return (
    <div className="grid gap-4">
      {transitions.map((transition) => (
        <Card key={transition.id}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">
                {transition.fromPosition?.title ||
                  transition.fromPositionId}{' '}
                → {transition.toPosition?.title || transition.toPositionId}
              </h3>
              <p className="text-sm text-gray-600">{transition.type}</p>
              {transition.requiredSkills &&
                transition.requiredSkills.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Skills:{' '}
                    {transition.requiredSkills
                      .map((s) => s.name)
                      .join(', ')}
                  </p>
                )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => onEdit(transition)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => onDelete(transition.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
