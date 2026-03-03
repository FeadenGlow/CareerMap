import type { Skill } from '@entities/skill/types';
import { Modal } from '@shared/ui/Modal';
import { Button } from '@shared/ui/Button';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: Skill[];
  onAdd: (skillId: string) => void;
  addingSkillId: string | null;
}

export function AddSkillModal({
  isOpen,
  onClose,
  skills,
  onAdd,
  addingSkillId,
}: AddSkillModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title="Add skill"
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {skills.length === 0 ? (
          <p className="text-gray-500">No more skills to add.</p>
        ) : (
          skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
            >
              <span>
                {skill.name}
                {skill.category && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({skill.category})
                  </span>
                )}
              </span>
              <Button
                onClick={() => onAdd(skill.id)}
                disabled={addingSkillId === skill.id}
              >
                {addingSkillId === skill.id ? 'Adding…' : 'Add'}
              </Button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
