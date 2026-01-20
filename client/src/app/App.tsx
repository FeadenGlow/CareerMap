import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router/AppRouter';
import { AuthProvider } from './providers/AuthProvider';
import { ErrorBoundary } from './ErrorBoundary';

export const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

