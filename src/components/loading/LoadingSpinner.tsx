import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center gap-3">
        <div className={`${sizeClasses[size]} border-2 border-white/30 border-t-emerald-400 rounded-full animate-spin`} />
        {text && (
          <p className="text-white/70 text-sm">{text}</p>
        )}
      </div>
    </div>
  );
};