'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { ChartBarIcon, ArrowTrendingUpIcon, CurrencyDollarIcon, DocumentChartBarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const { user } = useAuth();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      title: 'Track Your Expenses',
      description: 'Easily log and categorize your daily expenses to gain insights into your spending habits.',
      icon: CurrencyDollarIcon,
    },
    {
      title: 'Smart Budgeting',
      description: 'Create customized budgets for different categories and track your progress in real-time.',
      icon: DocumentChartBarIcon,
    },
    {
      title: 'Wealth Analytics',
      description: 'Visualize your financial data with interactive charts and reports for better decision making.',
      icon: ChartBarIcon,
    },
    {
      title: 'Net Worth Tracking',
      description: 'Monitor your assets and liabilities to track your financial growth over time.',
      icon: ArrowTrendingUpIcon,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Take Control of Your Finances
            </h1>
            <p className="text-xl mb-8 text-indigo-100">
              FinTrack helps you track expenses, manage budgets, and build wealth with powerful analytics and smart insights.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                href={user ? "/dashboard" : "/auth/signup"} 
                className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center justify-center"
              >
                {user ? "Go to Dashboard" : "Get Started"} 
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              {!user && (
                <Link 
                  href="/auth/login" 
                  className="bg-indigo-700 text-white hover:bg-indigo-800 px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Powerful Financial Tools
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to manage your personal finances in one place
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                variants={fadeIn}
              >
                <div className="bg-indigo-100 dark:bg-indigo-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-16 bg-indigo-600 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to transform your financial life?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already taken control of their financial future with FinTrack.
          </p>
          <Link 
            href={user ? "/dashboard" : "/auth/signup"}
            className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg font-semibold shadow-lg inline-flex items-center transition-all duration-200"
          >
            {user ? "Go to Dashboard" : "Start Your Financial Journey"}
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-white">FinTrack</h3>
              <p>Your personal finance companion</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p>&copy; {new Date().getFullYear()} FinTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
