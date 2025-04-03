import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'indigo-500',
  className = ''
}) => {
  // Define size classes
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-t-${color} border-r-transparent border-b-${color} border-l-transparent ${sizeClasses[size]} ${className}`}
      aria-label="Loading"
    ></div>
  );
};

export default LoadingSpinner; 