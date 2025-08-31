import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { BaseComponentProps, InteractiveProps, ComponentSize, ComponentVariant } from './types';

interface ButtonProps extends 
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  BaseComponentProps,
  InteractiveProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  icon?: React.ComponentType<any>;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const buttonStyles = {
  base: `
    relative overflow-hidden rounded-2xl font-medium transition-all duration-300 
    focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-gray-900
    flex items-center justify-center cursor-pointer touch-target
    white-space: nowrap text-overflow: ellipsis
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  variants: {
    default: `
      bg-emerald-600/20 border border-emerald-500/30 text-white backdrop-blur-md 
      hover:bg-emerald-500/40 hover:border-emerald-400/60 
      hover:shadow-lg hover:shadow-emerald-500/25
    `,
    destructive: `
      bg-red-600/20 border border-red-500/30 text-white backdrop-blur-md 
      hover:bg-red-500/40 hover:border-red-400/60 
      hover:shadow-lg hover:shadow-red-500/25
    `,
    outline: `
      border border-white/20 text-white backdrop-blur-md 
      hover:bg-white/15 hover:border-white/40 
      hover:shadow-lg hover:shadow-white/10
    `,
    ghost: `
      text-white hover:bg-white/15 hover:shadow-lg hover:shadow-white/10
    `
  },
  sizes: {
    sm: 'px-3 py-2 text-sm h-9 min-w-[2.25rem]',
    md: 'px-4 py-3 text-base h-12 min-w-[3rem]',
    lg: 'px-6 py-4 text-lg h-14 min-w-[3.5rem]'
  }
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    className, 
    children, 
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    isLoading = false,
    disabled,
    onClick,
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        className={cn(
          buttonStyles.base,
          buttonStyles.variants[variant],
          buttonStyles.sizes[size],
          fullWidth && 'w-full',
          className
        )}
        onClick={!isDisabled ? onClick : undefined}
        disabled={isDisabled}
        style={{
          textShadow: variant === 'default' ? '0 0 8px rgba(0, 163, 108, 0.6)' : 'none'
        }}
        {...props}
      >
        <div className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
              {children && <span className="truncate">{children}</span>}
              {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
            </>
          )}
        </div>
        
        {/* Neon glow effect overlay - only on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 via-emerald-400/0 to-emerald-600/0 opacity-0 hover:opacity-20 transition-opacity duration-300" />
        
        {/* Additional glow border on hover */}
        <div className="absolute inset-0 rounded-2xl border border-transparent hover:border-emerald-400/30 hover:shadow-[0_0_20px_rgba(0,163,108,0.3)] transition-all duration-300" />
      </motion.button>
    );
  }
);

Button.displayName = 'Button';