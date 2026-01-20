import { useEffect, useState } from 'react';
import { useAuth } from '@app/providers/AuthProvider';
import { userApi } from '@entities/user/api/userApi';
import { skillApi } from '@entities/skill/api/skillApi';
import type { User } from '@entities/user/types';
import type { Skill } from '@entities/skill/types';
import { Card } from '@shared/ui/Card';
import { LoadingSpinner } from '@shared/ui/LoadingSpinner';
import { ErrorMessage } from '@shared/ui/ErrorMessage';
import { Button } from '@shared/ui/Button';
import { Modal } from '@shared/ui/Modal';

export const ProfileCard = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [savingSkills, setSavingSkills] = useState(false);

  useEffect(() => {
    if (authUser) {
      loadProfile();
    }
  }, [authUser]);

  const loadProfile = async () => {
    try {
      setError(null);
      const profile = await userApi.getProfile();
      setUser(profile);
      setSelectedSkillIds(profile.skills?.map((s) => s.id) || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadAllSkills = async () => {
    try {
      const skills = await skillApi.getAll();
      setAllSkills(skills);
    } catch (err: any) {
      console.error('Failed to load skills:', err);
    }
  };

  const handleOpenSkillsModal = async () => {
    await loadAllSkills();
    setShowSkillsModal(true);
  };

  const handleSaveSkills = async () => {
    try {
      setSavingSkills(true);
      const updatedProfile = await userApi.updateSkills(selectedSkillIds);
      setUser(updatedProfile);
      setShowSkillsModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update skills');
    } finally {
      setSavingSkills(false);
    }
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  if (loading) {
    return (
      <Card>
        <LoadingSpinner />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <ErrorMessage message={error} />
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <ErrorMessage message="No user data available" />
      </Card>
    );
  }

  return (
    <>
      <Card>
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Role:</strong> {user.role}
            </div>
            {user.position && (
              <div>
                <strong>Position:</strong> {user.position.title} (Level {user.position.level}) - {user.position.department}
              </div>
            )}
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <strong>Skills:</strong>
              <Button variant="secondary" onClick={handleOpenSkillsModal}>
                {user.skills && user.skills.length > 0 ? 'Edit Skills' : 'Add Skills'}
              </Button>
            </div>
            {user.skills && user.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {user.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No skills added yet</p>
            )}
          </div>
        </div>
      </Card>

      {showSkillsModal && (
        <Modal
          isOpen={showSkillsModal}
          title="Manage Skills"
          onClose={() => setShowSkillsModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowSkillsModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSkills} disabled={savingSkills}>
                {savingSkills ? 'Saving...' : 'Save'}
              </Button>
            </>
          }
        >
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allSkills.map((skill) => (
              <label
                key={skill.id}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSkillIds.includes(skill.id)}
                  onChange={() => toggleSkill(skill.id)}
                  className="rounded"
                />
                <span>{skill.name}</span>
                {skill.category && (
                  <span className="text-xs text-gray-500">({skill.category})</span>
                )}
              </label>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
};

