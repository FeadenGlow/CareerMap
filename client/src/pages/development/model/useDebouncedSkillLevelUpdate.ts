import { useState, useCallback, useRef, useEffect } from 'react';
import { userApi } from '@entities/user/api/userApi';
import type { DevelopmentProfile } from '@entities/development/types';

const SAVED_LABEL_RESET_MS = 2000;

interface UseDebouncedSkillLevelUpdateParams {
  profile: DevelopmentProfile | null;
  setProfile: (fn: (prev: DevelopmentProfile) => DevelopmentProfile) => void;
  loadProfile: () => Promise<void>;
  debounceMs?: number;
}

export function useDebouncedSkillLevelUpdate({
  profile: _profile,
  setProfile,
  loadProfile,
  debounceMs = 400,
}: UseDebouncedSkillLevelUpdateParams) {
  const [savingLevelSkillId, setSavingLevelSkillId] = useState<string | null>(
    null,
  );
  const [savedLevelSkillId, setSavedLevelSkillId] = useState<string | null>(
    null,
  );
  const levelDebounceRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  useEffect(() => {
    return () => {
      Object.values(levelDebounceRef.current).forEach(clearTimeout);
      levelDebounceRef.current = {};
    };
  }, []);

  const handleLevelChange = useCallback(
    (skillId: string, level: number) => {
      const clamped = Math.max(0, Math.min(100, level));
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          userSkills: prev.userSkills.map((us) =>
            us.skillId === skillId ? { ...us, level: clamped } : us,
          ),
        };
      });

      const prev = levelDebounceRef.current[skillId];
      if (prev) clearTimeout(prev);
      levelDebounceRef.current[skillId] = setTimeout(async () => {
        delete levelDebounceRef.current[skillId];
        setSavingLevelSkillId(skillId);
        setSavedLevelSkillId(null);
        try {
          await userApi.updateSkillLevel(skillId, clamped);
          setSavedLevelSkillId(skillId);
          setTimeout(() => setSavedLevelSkillId(null), SAVED_LABEL_RESET_MS);
        } catch {
          await loadProfile();
        } finally {
          setSavingLevelSkillId((id) => (id === skillId ? null : id));
        }
      }, debounceMs);
    },
    [setProfile, loadProfile, debounceMs],
  );

  return {
    handleLevelChange,
    savingLevelSkillId,
    savedLevelSkillId,
  };
}
