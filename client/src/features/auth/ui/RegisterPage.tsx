import { Link } from 'react-router-dom';
import { RegisterForm } from './RegisterForm';
import { Card } from '@shared/ui/Card';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </Card>
    </div>
  );
};

