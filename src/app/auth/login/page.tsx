import React from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login | FinTrack',
  description: 'Sign in to your FinTrack account to manage your personal finances',
};

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">FinTrack</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Your personal finance companion</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage; 