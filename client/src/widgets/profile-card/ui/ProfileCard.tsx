import { useEffect, useState } from 'react';
import { useAuth } from '@app/providers/AuthProvider';
import { userApi } from '@entities/user/api/userApi';
import { skillApi } from '@entities/skill/api/skillApi';
import type { User, UserSkillWithLevel } from '@entities/user/types';
import type { Skill } from '@entities/skill/types';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { LoadingSpinner } from '@shared/ui/LoadingSpinner';
import { ErrorMessage } from '@shared/ui/ErrorMessage';
import { Button } from '@shared/ui/Button';
import { Modal } from '@shared/ui/Modal';

const GROWTH_LABELS: Record<string, { label: string; hint: string }> = {
  VERTICAL: { label: 'Vertical growth', hint: 'Level promotion' },
  HORIZONTAL: { label: 'Horizontal growth', hint: 'Same level, broader scope' },
  ROLE_CHANGE: { label: 'Role change', hint: 'Switch direction' },
};

function getInitials(email: string): string {
  const part = email.split('@')[0] || '';
  if (part.length >= 2) return part.slice(0, 2).toUpperCase();
  return part.toUpperCase() || '?';
}

function profileCompleteness(
  user: User,
  userSkillsCount: number,
): { percent: number; missing: string[] } {
  const missing: string[] = [];
  let filled = 0;
  const total = 7;
  if (user.email) filled++;
  if (user.role) filled++;
  if (user.position) filled++;
  if (user.currentPosition || user.currentPositionId) filled++;
  else missing.push('Current position / target');
  if (user.growthType) filled++;
  else missing.push('Growth type');
  if (user.interests?.length) filled++;
  else missing.push('Interests');
  if (userSkillsCount > 0) filled++;
  else missing.push('Skills');
  return { percent: Math.round((filled / total) * 100), missing };
}

interface ProfileCardProps {
  openSkillsModal?: boolean;
  onCloseSkillsModal?: () => void;
}

export const ProfileCard = ({
  openSkillsModal = false,
  onCloseSkillsModal,
}: ProfileCardProps) => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkillWithLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<Record<string, number>>(
    {},
  );
  const [savingSkills, setSavingSkills] = useState(false);

  useEffect(() => {
    if (authUser) {
      loadProfile();
    }
  }, [authUser]);

  useEffect(() => {
    if (openSkillsModal) setShowSkillsModal(true);
  }, [openSkillsModal]);

  const loadProfile = async () => {
    try {
      setError(null);
      const [profile, skills] = await Promise.all([
        userApi.getProfile(),
        userApi.getSkills(),
      ]);
      setUser(profile);
      setUserSkills(skills);
      setSelectedSkillIds(skills.map((s) => s.skillId));
      setSelectedLevels(
        Object.fromEntries(skills.map((s) => [s.skillId, s.level])),
      );
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

  const handleCloseSkillsModal = () => {
    setShowSkillsModal(false);
    onCloseSkillsModal?.();
  };

  const handleSaveSkills = async () => {
    try {
      setSavingSkills(true);
      const skills = selectedSkillIds.map((skillId) => ({
        skillId,
        level: Math.max(0, Math.min(100, selectedLevels[skillId] ?? 50)),
      }));
      const updated = await userApi.putSkills({ skills });
      setUserSkills(updated);
      handleCloseSkillsModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update skills');
    } finally {
      setSavingSkills(false);
    }
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId],
    );
  };

  const setSkillLevel = (skillId: string, level: number) => {
    setSelectedLevels((prev) => ({
      ...prev,
      [skillId]: Math.max(0, Math.min(100, level)),
    }));
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

  const completeness = profileCompleteness(user, userSkills.length);
  const growthInfo = user.growthType
    ? GROWTH_LABELS[user.growthType] || {
        label: user.growthType,
        hint: '',
      }
    : null;

  return (
    <>
      <Card className="overflow-hidden">
        {/* Profile header */}
        <div className="bg-gray-50 -m-6 p-6 mb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xl font-semibold shrink-0"
              aria-hidden
            >
              {getInitials(user.email)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-medium text-gray-900 truncate">
                {user.email}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">Account</p>
            </div>
            <span
              className="shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800"
              title="Role"
            >
              {user.role}
            </span>
          </div>
        </div>

        {/* Profile completeness */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Profile completeness: {completeness.percent}%
          </p>
          {completeness.missing.length > 0 && (
            <p className="text-xs text-gray-500">
              Add: {completeness.missing.join(', ').toLowerCase()}
            </p>
          )}
        </div>

        <div className="space-y-8">
          {/* Account */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Account
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">
                  Email
                </p>
                <p className="text-base text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Role</p>
                <p className="text-base text-gray-900">{user.role}</p>
              </div>
            </div>
          </section>

          {/* Career */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Career
            </h3>
            <div className="space-y-4">
              {user.position && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">
                    Official position / by HR
                  </p>
                  <p className="text-base text-gray-900 break-words">
                    {user.position.title} (Level {user.position.level}) —{' '}
                    {user.position.department}
                  </p>
                </div>
              )}
              {(user.currentPosition || user.currentPositionId) && (
                <div className="flex flex-wrap items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-0.5">
                      Target / current track / selected for growth
                    </p>
                    <p className="text-base text-gray-900 break-words">
                      {user.currentPosition
                        ? `${user.currentPosition.title} (Level ${user.currentPosition.level}) — ${user.currentPosition.department}`
                        : user.currentPositionId}
                    </p>
                  </div>
                  <span
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800"
                    title="Target position"
                  >
                    <Icon
                      name="target"
                      width={14}
                      height={14}
                      className="shrink-0"
                    />
                    Target
                  </span>
                </div>
              )}
              {growthInfo && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Growth type
                  </p>
                  <p className="text-xs text-gray-500 mb-1.5">
                    Defines preferred transition type
                  </p>
                  <span className="inline-block px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-800">
                    {growthInfo.label}
                  </span>
                  {growthInfo.hint && (
                    <p className="text-xs text-gray-500 mt-1">
                      {growthInfo.hint}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Interests */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Interests
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              Affects recommendations and path highlighting
            </p>
            {user.interests && user.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">None selected</p>
            )}
          </section>

          {/* Skills */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Skills
            </h3>
            {userSkills.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2 mb-3">
                  {userSkills.map((us) => (
                    <span
                      key={us.skillId}
                      className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {us.skill.name} ({us.level}%)
                    </span>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  onClick={handleOpenSkillsModal}
                  className="mt-2"
                >
                  Manage skills
                </Button>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Add skills — we&apos;ll highlight matching transitions in the
                  graph.
                </p>
                <Button onClick={handleOpenSkillsModal}>Add skills</Button>
              </div>
            )}
          </section>
        </div>
      </Card>

      {showSkillsModal && (
        <Modal
          isOpen={showSkillsModal}
          title="Manage Skills"
          onClose={handleCloseSkillsModal}
          footer={
            <>
              <Button variant="secondary" onClick={handleCloseSkillsModal}>
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
              <div
                key={skill.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
              >
                <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedSkillIds.includes(skill.id)}
                    onChange={() => toggleSkill(skill.id)}
                    className="rounded"
                  />
                  <span>{skill.name}</span>
                  {skill.category && (
                    <span className="text-xs text-gray-500">
                      ({skill.category})
                    </span>
                  )}
                </label>
                {selectedSkillIds.includes(skill.id) && (
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selectedLevels[skill.id] ?? 50}
                      onChange={(e) =>
                        setSkillLevel(
                          skill.id,
                          parseInt(e.target.value, 10) || 0,
                        )
                      }
                      className="w-14 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-500">%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
};
