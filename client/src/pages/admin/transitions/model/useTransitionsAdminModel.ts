import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { transitionApi } from '@entities/transition/api/transitionApi';
import { positionApi } from '@entities/position/api/positionApi';
import { skillApi } from '@entities/skill/api/skillApi';
import type { Transition } from '@entities/transition/types';
import type { Position } from '@entities/position/types';
import type { Skill } from '@entities/skill/types';
import { extractErrorMessage } from '@shared/lib/extractErrorMessage';

const transitionSchema = z.object({
  type: z.enum(['VERTICAL', 'HORIZONTAL', 'CHANGE']),
  fromPositionId: z.string().min(1, 'From position is required'),
  toPositionId: z.string().min(1, 'To position is required'),
  requiredSkillIds: z.array(z.string()).optional(),
});

export type TransitionFormData = z.infer<typeof transitionSchema>;

export function useTransitionsAdminModel() {
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransition, setEditingTransition] = useState<Transition | null>(
    null,
  );

  const form = useForm<TransitionFormData>({
    resolver: zodResolver(transitionSchema),
    defaultValues: {
      requiredSkillIds: [],
    },
  });

  const { register, handleSubmit, reset, watch, setValue } = form;

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [transitionsData, positionsData, skillsData] = await Promise.all([
        transitionApi.getAll(),
        positionApi.getAll(),
        skillApi.getAll(),
      ]);
      setTransitions(transitionsData);
      setPositions(positionsData);
      setSkills(skillsData);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = useCallback(
    async (data: TransitionFormData) => {
      try {
        setError(null);
        if (editingTransition) {
          await transitionApi.update(editingTransition.id, data);
        } else {
          await transitionApi.create(data);
        }
        await loadData();
        setIsModalOpen(false);
        setEditingTransition(null);
        reset();
      } catch (err: unknown) {
        setError(extractErrorMessage(err, 'Failed to save transition'));
      }
    },
    [editingTransition, loadData, reset],
  );

  const handleEdit = useCallback(
    (transition: Transition) => {
      setEditingTransition(transition);
      reset({
        type: transition.type,
        fromPositionId: transition.fromPositionId,
        toPositionId: transition.toPositionId,
        requiredSkillIds: transition.requiredSkills?.map((s) => s.id) || [],
      });
      setIsModalOpen(true);
    },
    [reset],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to delete this transition?')) return;
      try {
        setError(null);
        await transitionApi.delete(id);
        await loadData();
      } catch (err: unknown) {
        setError(extractErrorMessage(err, 'Failed to delete transition'));
      }
    },
    [loadData],
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTransition(null);
    reset();
  }, [reset]);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const toggleSkill = useCallback(
    (skillId: string) => {
      const current = watch('requiredSkillIds') || [];
      if (current.includes(skillId)) {
        setValue(
          'requiredSkillIds',
          current.filter((id) => id !== skillId),
        );
      } else {
        setValue('requiredSkillIds', [...current, skillId]);
      }
    },
    [watch, setValue],
  );

  return {
    transitions,
    positions,
    skills,
    loading,
    error,
    setError,
    isModalOpen,
    editingTransition,
    form: { register, handleSubmit, reset, watch, setValue },
    loadData,
    onSubmit,
    handleEdit,
    handleDelete,
    toggleSkill,
    openModal,
    closeModal,
  };
}
