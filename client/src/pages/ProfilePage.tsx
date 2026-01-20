import { ProfileCard } from '@widgets/profile-card/ui/ProfileCard';
import { useAuth } from '@app/providers/AuthProvider';
import { Button } from '@shared/ui/Button';

export const ProfilePage = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Profile</h1>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileCard />
      </div>
    </div>
  );
};

