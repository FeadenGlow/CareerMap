import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/config/routes';
import { Card } from '@shared/ui/Card';
import { Button } from '@shared/ui/Button';
import { LoadingSpinner } from '@shared/ui/LoadingSpinner';
import { ErrorMessage } from '@shared/ui/ErrorMessage';
import { useDevelopmentPageModel } from '../model/useDevelopmentPageModel';
import { useDebouncedSkillLevelUpdate } from '../model/useDebouncedSkillLevelUpdate';
import { GoalSection } from './sections/GoalSection';
import { MySkillsSection } from './sections/MySkillsSection';
import { SkillGapsSection } from './sections/SkillGapsSection';
import { AddSkillModal } from './sections/AddSkillModal';

const LEVEL_DEBOUNCE_MS = 400;

export function DevelopmentPage() {
  const navigate = useNavigate();
  const model = useDevelopmentPageModel();
  const { handleLevelChange, savingLevelSkillId, savedLevelSkillId } =
    useDebouncedSkillLevelUpdate({
      profile: model.profile,
      setProfile: model.setProfile,
      loadProfile: model.loadProfile,
      debounceMs: LEVEL_DEBOUNCE_MS,
    });

  if (model.loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Card>
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  if (model.error && !model.profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <ErrorMessage message={model.error} />
        <Button
          onClick={() => {
            model.setError(null);
            model.loadProfile();
          }}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Development</h1>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(ROUTES.PROFILE)}
              >
                Profile
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(ROUTES.CAREER_PATHS)}
              >
                Career Paths
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {model.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {model.error}
          </div>
        )}

        <GoalSection
          goal={model.profile?.goal ?? null}
          selectedGoalId={model.selectedGoalId}
          onSelectedGoalIdChange={model.setSelectedGoalId}
          positions={model.positions}
          onSave={model.handleSaveGoal}
          saving={model.savingGoal}
        />

        <MySkillsSection
          userSkills={model.profile?.userSkills ?? []}
          onLevelChange={handleLevelChange}
          onDelete={model.handleDeleteSkill}
          savingLevelSkillId={savingLevelSkillId}
          savedLevelSkillId={savedLevelSkillId}
          onAddSkill={model.handleOpenAddSkill}
        />

        <SkillGapsSection profile={model.profile} />
      </div>

      {model.addSkillModal && (
        <AddSkillModal
          isOpen={model.addSkillModal}
          onClose={() => model.setAddSkillModal(false)}
          skills={model.allSkills}
          onAdd={model.handleAddSkill}
          addingSkillId={model.addingSkillId}
        />
      )}
    </div>
  );
}
