import React from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  animated?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  animated = true,
  className = '',
  disabled,
  onClick,
  type = 'button',
  ...props
}) => {
  // Base classes
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium focus:outline-none transition-colors';

  // Size classes
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg',
  };

  // Variant classes
  const variantClasses = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-300',
    secondary:
      'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800',
    success:
      'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:bg-green-300',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
    warning:
      'bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700 disabled:bg-yellow-200',
    info: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300',
    ghost:
      'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700',
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Disabled classes
  const disabledClasses = (disabled || isLoading) ? 'cursor-not-allowed opacity-75' : '';

  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${disabledClasses} ${className}`;

  const content = (
    <>
      {isLoading && (
        <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
      )}
      {icon && iconPosition === 'left' && !isLoading && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </>
  );

  if (animated) {
    return (
      <motion.button
        whileHover={{ scale: (disabled || isLoading) ? 1 : 1.02 }}
        whileTap={{ scale: (disabled || isLoading) ? 1 : 0.98 }}
        className={buttonClasses}
        disabled={disabled || isLoading}
        onClick={onClick}
        type={type}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <button 
      className={buttonClasses} 
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
    >
      {content}
    </button>
  );
};

export default Button; 