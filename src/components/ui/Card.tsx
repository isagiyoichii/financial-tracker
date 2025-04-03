import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, title, subtitle, icon, className = '', noPadding = false }) => {
  return (
    <motion.div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 ${className}`}
      whileHover={{ 
        y: -4, 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        borderColor: 'rgba(99, 102, 241, 0.4)' 
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {(title || icon) && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750">
          <div className="flex items-center">
            {icon && <div className="mr-3 text-indigo-500 dark:text-indigo-400">{icon}</div>}
            <div>
              {title && <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">{title}</h3>}
              {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
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
