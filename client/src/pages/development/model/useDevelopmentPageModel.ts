import { useEffect, useState, useCallback } from 'react';
import { developmentApi } from '@entities/development/api/developmentApi';
import { userApi } from '@entities/user/api/userApi';
import { positionApi } from '@entities/position/api/positionApi';
import { skillApi } from '@entities/skill/api/skillApi';
import type { DevelopmentProfile } from '@entities/development/types';
import type { Position } from '@entities/position/types';
import type { Skill } from '@entities/skill/types';
import { extractErrorMessage } from '@shared/lib/extractErrorMessage';

export function useDevelopmentPageModel() {
  const [profile, setProfile] = useState<DevelopmentProfile | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [savingGoal, setSavingGoal] = useState(false);
  const [addSkillModal, setAddSkillModal] = useState(false);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [addingSkillId, setAddingSkillId] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setError(null);
      const data = await developmentApi.getProfile();
      setProfile(data);
      setSelectedGoalId(data.goal?.targetPositionId ?? '');
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Failed to load development profile'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    positionApi.getAll().then(setPositions).catch(() => {});
  }, []);

  const handleSaveGoal = useCallback(async () => {
    if (!selectedGoalId) return;
    try {
      setSavingGoal(true);
      await developmentApi.setGoal(selectedGoalId);
      await loadProfile();
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Failed to set goal'));
    } finally {
      setSavingGoal(false);
    }
  }, [selectedGoalId, loadProfile]);

  const handleDeleteSkill = useCallback(
    async (skillId: string) => {
      try {
        await userApi.deleteSkill(skillId);
        await loadProfile();
      } catch (err: unknown) {
        setError(extractErrorMessage(err, 'Failed to remove skill'));
      }
    },
    [loadProfile],
  );

  const handleOpenAddSkill = useCallback(async () => {
    try {
      const skills = await skillApi.getAll();
      const existingIds = new Set(
        profile?.userSkills.map((us) => us.skillId) ?? [],
      );
      setAllSkills(skills.filter((s) => !existingIds.has(s.id)));
      setAddSkillModal(true);
    } catch {
      setError('Failed to load skills');
    }
  }, [profile?.userSkills]);

  const handleAddSkill = useCallback(
    async (skillId: string) => {
      try {
        setAddingSkillId(skillId);
        await userApi.addSkill(skillId, 50);
        await loadProfile();
        setAddSkillModal(false);
      } catch (err: unknown) {
        setError(extractErrorMessage(err, 'Failed to add skill'));
      } finally {
        setAddingSkillId(null);
      }
    },
    [loadProfile],
  );

  return {
    profile,
    setProfile,
    positions,
    loading,
    error,
    setError,
    selectedGoalId,
    setSelectedGoalId,
    savingGoal,
    addSkillModal,
    setAddSkillModal,
    allSkills,
    setAllSkills,
    addingSkillId,
    setAddingSkillId,
    loadProfile,
    handleSaveGoal,
    handleDeleteSkill,
    handleOpenAddSkill,
    handleAddSkill,
  };
}
