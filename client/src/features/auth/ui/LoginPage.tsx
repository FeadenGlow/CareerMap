import { Link } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { Card } from '@shared/ui/Card';

export const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </Card>
    </div>
  );
};

