import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BaseComponentProps, ComponentSize } from './types';

interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  isDragging?: boolean;
  noPadding?: boolean;
  size?: ComponentSize;
  hoverable?: boolean;
}

const cardStyles = {
  base: `
    relative rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md
    shadow-lg shadow-black/20 transition-all duration-300
  `,
  sizes: {
    sm: 'p-3',
    md: 'p-4', 
    lg: 'p-6'
  },
  dragging: 'shadow-2xl shadow-emerald-500/20 border-emerald-500/30',
  hoverable: 'hover:border-white/20 hover:shadow-xl hover:shadow-black/30'
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    title, 
    subtitle, 
    actions, 
    isDragging = false, 
    noPadding = false,
    size = 'md',
    hoverable = false,
    children, 
    ...props 
  }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          cardStyles.base,
          !noPadding && cardStyles.sizes[size],
          isDragging && cardStyles.dragging,
          hoverable && cardStyles.hoverable,
          className
        )}
        {...props}
      >
        {/* Glass effect overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {/* Header */}
        {(title || actions) && (
          <div className={cn(
            "relative flex items-start justify-between",
            !noPadding && "mb-3"
          )}>
            <div className="min-w-0 flex-1">
              {title && (
                <h3 className="text-base font-semibold text-white text-balance">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-white/70 mt-1 text-balance">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="relative">
          {children}
        </div>
      </motion.div>
    );
  }
);

Card.displayName = 'Card';