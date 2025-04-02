'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

const HomePage = () => {
  const { user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <>
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Take Control of Your Financial Future
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Track expenses, manage budgets, monitor investments, and grow your net worth - all in one secure platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/auth/signup">
                  <Button 
                    variant="secondary"
                    size="lg"
                    className="text-indigo-700 hover:bg-white"
                  >
                    Get Started - It&apos;s Free
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button 
                    variant="ghost"
                    size="lg"
                    className="text-white border border-white hover:bg-white/10"
                  >
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative h-96">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl">
                <div className="relative h-full w-full p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Financial Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Income</p>
                        <p className="text-xl font-bold text-indigo-600">$5,240</p>
                      </div>
                      <div className="bg-pink-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Expenses</p>
                        <p className="text-xl font-bold text-pink-600">$3,180</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Net Worth</h3>
                      <p className="text-xl font-bold text-green-600">$124,500</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Investments</h3>
                      <p className="text-xl font-bold text-blue-600">$78,350</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              All the Tools You Need for Financial Success
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              FinTrack combines powerful features to help you build wealth, reduce debt, and achieve financial freedom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Expense Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Easily track and categorize your daily expenses and income.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Smart Budgeting
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Set monthly budgets and get alerts when you are close to limits.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Net Worth Calculation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track your assets and liabilities to calculate your real-time net worth.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Interactive Dashboards
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Visualize your financial data with beautiful and interactive charts.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Investment Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor your investments with real-time market data integration.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Bank-Level Security
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your data is encrypted and secured with the latest security protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Financial Life?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of users who have already taken control of their finances with FinTrack.
            </p>
            <Link href="/auth/signup">
              <Button 
                variant="secondary"
                size="lg"
                className="text-indigo-700 hover:bg-white"
              >
                Start Your Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">FinTrack</h3>
              <p className="text-gray-400">
                Your personal finance companion for budgeting, expense tracking, and wealth building.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Expense Tracking</li>
                <li>Budgeting</li>
                <li>Net Worth</li>
                <li>Investment Tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Support</li>
                <li>FAQ</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} FinTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default HomePage;
