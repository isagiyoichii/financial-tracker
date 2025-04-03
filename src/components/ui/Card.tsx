import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  noPadding?: boolean;
  variant?: 'default' | 'luxury' | 'minimal';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  subtitle, 
  icon, 
  className = '', 
  noPadding = false,
  variant = 'default'
}) => {
  // Ferrari-inspired luxury styling
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
    luxury: 'bg-gradient-to-br from-gray-900 to-black border border-red-600 text-white',
    minimal: 'bg-white dark:bg-gray-800 border-none shadow-lg'
  };

  const headerClasses = {
    default: 'px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750',
    luxury: 'px-6 py-5 border-b border-red-700 bg-gradient-to-r from-black to-gray-900',
    minimal: 'px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-transparent'
  };

  const iconClasses = {
    default: 'text-indigo-500 dark:text-indigo-400',
    luxury: 'text-red-500',
    minimal: 'text-gray-700 dark:text-gray-300'
  };

  return (
    <motion.div 
      className={`rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${variantClasses[variant]} ${className}`}
      whileHover={{ 
        y: -4, 
        boxShadow: variant === 'luxury' 
          ? '0 20px 30px -5px rgba(220, 38, 38, 0.2), 0 10px 15px -5px rgba(0, 0, 0, 0.3)' 
          : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        borderColor: variant === 'luxury' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(99, 102, 241, 0.4)'
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {(title || icon) && (
        <div className={`${headerClasses[variant]}`}>
          <div className="flex items-center">
            {icon && <div className={`mr-3 ${iconClasses[variant]}`}>{icon}</div>}
            <div>
              {title && (
                <h3 className={`text-lg font-semibold leading-6 ${
                  variant === 'luxury' ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={`mt-1 text-sm ${
                  variant === 'luxury' ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className={`${noPadding ? '' : 'p-6'} transition-all duration-300`}>
        {children}
      </div>
    </motion.div>
  );
};

export default Card;
