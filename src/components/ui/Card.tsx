import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  onClick,
  icon,
  footer,
  isLoading = false,
}) => {
  return (
    <motion.div
      whileHover={onClick ? { y: -5 } : {}}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="p-6 flex flex-col items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      ) : (
        <>
          {(title || icon) && (
            <div className="p-6 pb-0 flex justify-between items-center">
              <div>
                {title && (
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
              {icon && (
                <div className="text-indigo-500 dark:text-indigo-400">
                  {icon}
                </div>
              )}
            </div>
          )}
          <div className="p-6">{children}</div>
          {footer && <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700">{footer}</div>}
        </>
      )}
    </motion.div>
  );
};

export default Card;
