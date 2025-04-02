import React from 'react';
import SignupForm from '@/components/auth/SignupForm';

export const metadata = {
  title: 'Sign Up | FinTrack',
  description: 'Create your FinTrack account to start managing your personal finances',
};

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">FinTrack</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Your personal finance companion</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage; 