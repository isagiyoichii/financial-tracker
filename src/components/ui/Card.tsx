import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  icon,
  children,
  className = '',
  onClick,
  animate = true,
}) => {
  const cardContent = (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden ${className}`}
      onClick={onClick}
    >
      {(title || icon) && (
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            {icon && <div className="mr-3 text-gray-500 dark:text-gray-400">{icon}</div>}
            <div>
              {title && (
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={onClick ? { y: -5, transition: { duration: 0.2 } } : undefined}
        className={onClick ? 'cursor-pointer' : ''}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};

export default Card;
