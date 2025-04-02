'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { loginWithEmail, loginWithGoogle, resetPassword } from '@/lib/firebase/auth';
import Button from '@/components/ui/Button';
import { FirebaseError } from 'firebase/app';

type LoginFormData = {
  email: string;
  password: string;
};

interface FirebaseErrorWithMessage extends Error {
  message: string;
  code?: string;
}

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await loginWithEmail(data.email, data.password);
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      const firebaseError = err as FirebaseErrorWithMessage;
      setError(firebaseError.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      const firebaseError = err as FirebaseErrorWithMessage;
      setError(firebaseError.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      const firebaseError = err as FirebaseErrorWithMessage;
      setError(firebaseError.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full"
    >
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Welcome Back</h1>

      {resetSent ? (
        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-md mb-6">
          <p className="text-green-700 dark:text-green-200">
            Password reset email sent! Please check your inbox.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md mb-6">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="your@email.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="••••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>
      )}

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleGoogleSignIn}
            icon={<FcGoogle className="h-5 w-5" />}
            disabled={isLoading}
          >
            Sign in with Google
          </Button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <Button
          variant="ghost"
          onClick={() => router.push('/auth/signup')}
          className="p-0 text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Sign up
        </Button>
      </p>
    </motion.div>
  );
};

export default LoginForm; 