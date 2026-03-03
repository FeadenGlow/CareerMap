import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/config/routes';
import { ProfileCard } from '@widgets/profile-card/ui/ProfileCard';
import { useAuth } from '@app/providers/AuthProvider';
import { Button } from '@shared/ui/Button';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showManageSkills, setShowManageSkills] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Profile</h1>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(ROUTES.DEVELOPMENT)}
              >
                Development
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(ROUTES.CAREER_PATHS)}
              >
                Career Paths
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(ROUTES.ONBOARDING)}
              >
                Edit preferences
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowManageSkills(true)}
              >
                Manage skills
              </Button>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileCard
          openSkillsModal={showManageSkills}
          onCloseSkillsModal={() => setShowManageSkills(false)}
        />
      </div>
    </div>
  );
};
