import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/config/routes';
import { useAuth } from '@app/providers/AuthProvider';
import { useOnboarding } from '@app/providers/OnboardingProvider';
import { LoginPage } from '@features/auth/ui/LoginPage';
import { RegisterPage } from '@features/auth/ui/RegisterPage';
import { CareerPathView } from '@features/view-career-path/ui/CareerPathView';
import { ProfilePage } from '@pages/ProfilePage';
import { DevelopmentPage } from '@pages/development';
import { OnboardingPage } from '@pages/onboarding';
import {
  PositionsAdminPage,
  SkillsAdminPage,
  TransitionsAdminPage,
} from '@pages/admin';
import { LoadingSpinner } from '@shared/ui/LoadingSpinner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};

const OnboardingGate = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { onboardingCompleted, onboardingLoading } = useOnboarding();

  useEffect(() => {
    if (onboardingLoading) return;
    if (!onboardingCompleted) {
      navigate(ROUTES.ONBOARDING, { replace: true });
    }
  }, [onboardingLoading, onboardingCompleted, navigate]);

  if (onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!onboardingCompleted) {
    return null;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user.role !== 'HR' && user.role !== 'ADMIN') {
    return <Navigate to={ROUTES.CAREER_PATHS} replace />;
  }

  return <>{children}</>;
};

export const AppRouter = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path={ROUTES.LOGIN}
        element={
          user ? <Navigate to={ROUTES.CAREER_PATHS} replace /> : <LoginPage />
        }
      />
      <Route
        path={ROUTES.REGISTER}
        element={
          user ? (
            <Navigate to={ROUTES.CAREER_PATHS} replace />
          ) : (
            <RegisterPage />
          )
        }
      />
      <Route
        path={ROUTES.ONBOARDING}
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CAREER_PATHS}
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <CareerPathView />
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <ProfilePage />
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DEVELOPMENT}
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <DevelopmentPage />
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_POSITIONS}
        element={
          <AdminRoute>
            <OnboardingGate>
              <PositionsAdminPage />
            </OnboardingGate>
          </AdminRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_SKILLS}
        element={
          <AdminRoute>
            <OnboardingGate>
              <SkillsAdminPage />
            </OnboardingGate>
          </AdminRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_TRANSITIONS}
        element={
          <AdminRoute>
            <OnboardingGate>
              <TransitionsAdminPage />
            </OnboardingGate>
          </AdminRoute>
        }
      />
      <Route path="/" element={<Navigate to={ROUTES.CAREER_PATHS} replace />} />
    </Routes>
  );
};
