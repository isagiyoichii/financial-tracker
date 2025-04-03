import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { useTheme } from '@/lib/context/theme-context';
import { logout } from '@/lib/firebase/auth';
import { 
  HomeIcon, 
  CurrencyDollarIcon, 
  ChartPieIcon, 
  ScaleIcon, 
  UserCircleIcon,
  CogIcon,
  SunIcon,
  MoonIcon,
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  PresentationChartLineIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Transactions', href: '/transactions', icon: CurrencyDollarIcon },
    { name: 'Budgeting', href: '/budgeting', icon: ChartPieIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Net Worth', href: '/networth', icon: ScaleIcon },
    { name: 'Investments', href: '/investments', icon: PresentationChartLineIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={user ? '/dashboard' : '/'} className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                FinTrack
              </Link>
            </div>
            
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'border-indigo-500 text-gray-900 dark:text-gray-100'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <Icon className="h-5 w-5 mr-1" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>
            
            {user ? (
              <div className="ml-3 flex items-center">
                <Link href="/settings" className="p-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    {user.photoURL ? (
                      <Image
                        className="h-8 w-8 rounded-full"
                        src={user.photoURL}
                        alt="User profile"
                        width={32}
                        height={32}
                      />
                    ) : (
                      <UserCircleIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu - only visible when user is logged in */}
      {user && (
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between px-4 py-3 space-x-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-400'
                  } flex flex-col items-center text-xs font-medium`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="mt-1">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 