import type { FormEventHandler } from 'react';
import type { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { Position } from '@entities/position/types';
import type { Skill } from '@entities/skill/types';
import type { TransitionFormData } from '../../model/useTransitionsAdminModel';
import { Modal } from '@shared/ui/Modal';
import { Button } from '@shared/ui/Button';

interface TransitionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  positions: Position[];
  skills: Skill[];
  register: UseFormRegister<TransitionFormData>;
  watch: UseFormWatch<TransitionFormData>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onToggleSkill: (skillId: string) => void;
  onCancel: () => void;
  isEdit: boolean;
}

export function TransitionFormModal({
  isOpen,
  onClose,
  title,
  positions,
  skills,
  register,
  watch,
  onSubmit,
  onToggleSkill,
  onCancel,
  isEdit,
}: TransitionFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            {...register('type')}
          >
            <option value="VERTICAL">Vertical</option>
            <option value="HORIZONTAL">Horizontal</option>
            <option value="CHANGE">Change</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Position
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            {...register('fromPositionId')}
          >
            <option value="">Select position</option>
            {positions.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.title} ({pos.department})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Position
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            {...register('toPositionId')}
          >
            <option value="">Select position</option>
            {positions.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.title} ({pos.department})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
            {skills.map((skill) => (
              <label key={skill.id} className="flex items-center gap-2 p-1">
                <input
                  type="checkbox"
                  checked={
                    watch('requiredSkillIds')?.includes(skill.id) || false
                  }
                  onChange={() => onToggleSkill(skill.id)}
                />
                <span>{skill.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit">{isEdit ? 'Update' : 'Create'}</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
