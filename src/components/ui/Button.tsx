import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'ghost' | 'ferrari';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'ferrari',
  size = 'md',
  icon,
  iconPosition = 'left',
  type = 'button',
  fullWidth = false,
  disabled = false,
  className = '',
  onClick,
  isLoading = false,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm transition-all duration-200';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white focus:ring-indigo-500 rounded-md',
    secondary: 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 focus:ring-gray-500 rounded-md',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white focus:ring-red-500 rounded-md',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white focus:ring-green-500 rounded-md',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white focus:ring-yellow-500 rounded-md',
    info: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white focus:ring-blue-500 rounded-md',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500 rounded-md',
    ferrari: 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white focus:ring-red-500 rounded-none uppercase tracking-wider font-bold'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const disabledClasses = disabled || isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Special styling for Ferrari variant
  const ferrariStyle = variant === 'ferrari' ? {
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
  } : {};
  
  return (
    <motion.button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClasses} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      whileHover={!disabled && !isLoading ? { 
        scale: variant === 'ferrari' ? 1.03 : 1.02,
        boxShadow: variant === 'ferrari' 
          ? '0 10px 15px -3px rgba(220, 38, 38, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      } : {}}
      transition={{ duration: 0.2 }}
      style={ferrariStyle}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>
      )}
      <span className={`font-medium ${variant === 'ferrari' ? 'font-bold' : ''}`}>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      
      {/* Add the signature red accent for Ferrari variant */}
      {variant === 'ferrari' && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400"></span>
      )}
    </motion.button>
  );
};

export default Button; 