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
  const { isDarkMode, toggleTheme } = useTheme();
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
    <nav className="ferrari-nav shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={user ? '/dashboard' : '/'} className="ferrari-text text-xl font-bold text-ferrari-red">
                <span className="text-white">Fin</span><span className="text-ferrari-red">TRACK</span>
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
                          ? 'border-ferrari-red text-white'
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                      } ferrari-nav-link inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
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
            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="text-gray-400 hover:text-white p-1 rounded-full focus:outline-none"
                >
                  {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="ferrari-button px-3 py-1.5 text-sm"
                >
                  Logout
                </button>
                
                <div className="flex items-center">
                  <Link href="/settings" className="flex items-center text-gray-300 hover:text-white">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full border-2 border-gray-600"
                      />
                    ) : (
                      <div className="bg-ferrari-red rounded-full p-1">
                        <UserCircleIcon className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="ferrari-nav-link text-gray-300 hover:text-white"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                  Login
                </Link>
                
                <Link
                  href="/auth/signup"
                  className="ferrari-button px-3 py-1.5 text-sm"
                >
                  Sign Up
                </Link>
                
                <button
                  onClick={toggleTheme}
                  className="text-gray-400 hover:text-white p-1 rounded-full focus:outline-none"
                >
                  {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu - only visible when user is logged in */}
      {user && (
        <div className="sm:hidden border-t border-gray-700">
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
                      ? 'text-ferrari-red'
                      : 'text-gray-400 hover:text-gray-300'
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