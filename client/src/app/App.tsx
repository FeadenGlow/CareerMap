import { BrowserRouter } from 'react-router-dom';
import { IconsSprite } from '@shared/assets/IconsSprite';
import { AppRouter } from './router/AppRouter';
import { AuthProvider } from './providers/AuthProvider';
import { OnboardingProvider } from './providers/OnboardingProvider';
import { ErrorBoundary } from './ErrorBoundary';

export const App = () => {
  return (
    <ErrorBoundary>
      <IconsSprite />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <OnboardingProvider>
            <AppRouter />
          </OnboardingProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
