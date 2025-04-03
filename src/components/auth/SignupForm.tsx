'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { signUp, signInWithGoogle } from '@/lib/firebase/auth';
import Button from '@/components/ui/Button';

type SignupFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

interface FirebaseErrorWithMessage extends Error {
  message: string;
  code?: string;
}

const SignupForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>();

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signUp(data.email, data.password, data.email.split('@')[0]);
      setSuccess('Account created successfully! Please verify your email before logging in.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: unknown) {
      console.error('Signup error:', err);
      const firebaseError = err as FirebaseErrorWithMessage;
      setError(firebaseError.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      const firebaseError = err as FirebaseErrorWithMessage;
      setError(firebaseError.message || 'Failed to sign in with Google. Please try again.');
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create Your Account</h1>

      {success ? (
        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-md mb-6">
          <p className="text-green-700 dark:text-green-200">{success}</p>
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
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="••••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="••••••••••"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'The passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            Create Account
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
            Sign up with Google
          </Button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Button
          variant="ghost"
          onClick={() => router.push('/auth/login')}
          className="p-0 text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Sign in
        </Button>
      </p>
    </motion.div>
  );
};

export default SignupForm; 