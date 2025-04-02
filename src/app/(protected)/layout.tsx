'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import Navbar from '@/components/ui/Navbar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ClientSideRedirect = () => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    
    useEffect(() => {
      if (!loading && !user && pathname !== '/auth/login' && pathname !== '/auth/signup') {
        router.push('/auth/login');
      }
    }, [user, loading, router, pathname]);
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="ml-3 text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      );
    }
    
    return <>{children}</>;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ClientSideRedirect />
      </main>
    </div>
  );
} 