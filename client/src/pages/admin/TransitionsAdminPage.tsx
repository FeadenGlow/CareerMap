import { useEffect, useState } from 'react';
import { transitionApi } from '@entities/transition/api/transitionApi';
import type { Transition, CreateTransitionDto, TransitionType } from '@entities/transition/types';
import { positionApi } from '@entities/position/api/positionApi';
import { skillApi } from '@entities/skill/api/skillApi';
import type { Position } from '@entities/position/types';
import type { Skill } from '@entities/skill/types';
import { Card } from '@shared/ui/Card';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Modal } from '@shared/ui/Modal';
import { useAuth } from '@app/providers/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const transitionSchema = z.object({
  type: z.enum(['VERTICAL', 'HORIZONTAL', 'CHANGE']),
  fromPositionId: z.string().min(1, 'From position is required'),
  toPositionId: z.string().min(1, 'To position is required'),
  requiredSkillIds: z.array(z.string()).optional(),
});

type TransitionFormData = z.infer<typeof transitionSchema>;

export const TransitionsAdminPage = () => {
  const { logout } = useAuth();
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransition, setEditingTransition] = useState<Transition | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransitionFormData>({
    resolver: zodResolver(transitionSchema),
    defaultValues: {
      requiredSkillIds: [],
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transitionsData, positionsData, skillsData] = await Promise.all([
        transitionApi.getAll(),
        positionApi.getAll(),
        skillApi.getAll(),
      ]);
      setTransitions(transitionsData);
      setPositions(positionsData);
      setSkills(skillsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TransitionFormData) => {
    try {
      if (editingTransition) {
        await transitionApi.update(editingTransition.id, data);
      } else {
        await transitionApi.create(data);
      }
      await loadData();
      setIsModalOpen(false);
      setEditingTransition(null);
      reset();
    } catch (error) {
      console.error('Failed to save transition:', error);
    }
  };

  const handleEdit = (transition: Transition) => {
    setEditingTransition(transition);
    reset({
      type: transition.type,
      fromPositionId: transition.fromPositionId,
      toPositionId: transition.toPositionId,
      requiredSkillIds: transition.requiredSkills?.map((s) => s.id) || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transition?')) {
      try {
        await transitionApi.delete(id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete transition:', error);
      }
    }
  };

  const toggleSkill = (skillId: string) => {
    const current = watch('requiredSkillIds') || [];
    if (current.includes(skillId)) {
      setValue('requiredSkillIds', current.filter((id) => id !== skillId));
    } else {
      setValue('requiredSkillIds', [...current, skillId]);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Manage Transitions</h1>
            <div className="flex items-center gap-4">
              <Button variant="secondary" onClick={() => (window.location.href = '/career-paths')}>
                Career Paths
              </Button>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Button onClick={() => setIsModalOpen(true)}>Create Transition</Button>
        </div>

        <div className="grid gap-4">
          {transitions.map((transition) => (
            <Card key={transition.id}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">
                    {transition.fromPosition?.title || transition.fromPositionId} → {transition.toPosition?.title || transition.toPositionId}
                  </h3>
                  <p className="text-sm text-gray-600">{transition.type}</p>
                  {transition.requiredSkills && transition.requiredSkills.length > 0 && (
                    <p className="text-xs text-gray-500">
                      Skills: {transition.requiredSkills.map((s) => s.name).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => handleEdit(transition)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(transition.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => (setIsModalOpen(false), setEditingTransition(null), reset())} title={editingTransition ? 'Edit Transition' : 'Create Transition'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md" {...register('type')}>
              <option value="VERTICAL">Vertical</option>
              <option value="HORIZONTAL">Horizontal</option>
              <option value="CHANGE">Change</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Position</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md" {...register('fromPositionId')}>
              <option value="">Select position</option>
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.title} ({pos.department})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Position</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md" {...register('toPositionId')}>
              <option value="">Select position</option>
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.title} ({pos.department})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
              {skills.map((skill) => (
                <label key={skill.id} className="flex items-center gap-2 p-1">
                  <input
                    type="checkbox"
                    checked={watch('requiredSkillIds')?.includes(skill.id) || false}
                    onChange={() => toggleSkill(skill.id)}
                  />
                  <span>{skill.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editingTransition ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="secondary" onClick={() => (setIsModalOpen(false), setEditingTransition(null), reset())}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

