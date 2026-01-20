import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@app/providers/AuthProvider';
import { LoginPage } from '@features/auth/ui/LoginPage';
import { RegisterPage } from '@features/auth/ui/RegisterPage';
import { CareerPathView } from '@features/view-career-path/ui/CareerPathView';
import { ProfilePage } from '@pages/ProfilePage';
import { PositionsAdminPage, SkillsAdminPage, TransitionsAdminPage } from '@pages/admin';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'HR' && user.role !== 'ADMIN') {
    return <Navigate to="/career-paths" replace />;
  }

  return <>{children}</>;
};

export const AppRouter = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/career-paths" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/career-paths" replace /> : <RegisterPage />} />
      <Route
        path="/career-paths"
        element={
          <ProtectedRoute>
            <CareerPathView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/positions"
        element={
          <AdminRoute>
            <PositionsAdminPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/skills"
        element={
          <AdminRoute>
            <SkillsAdminPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/transitions"
        element={
          <AdminRoute>
            <TransitionsAdminPage />
          </AdminRoute>
        }
      />
      <Route path="/" element={<Navigate to="/career-paths" replace />} />
    </Routes>
  );
};

