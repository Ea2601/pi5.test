import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CTAButtonProps {
  children: React.ReactNode;
  icon?: React.ComponentType<any>;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  title?: string;
  'aria-label'?: string;
}

const ctaVariants = {
  primary: `
    bg-emerald-600/20 border border-emerald-500/30 text-white
    hover:bg-emerald-500/40 hover:border-emerald-400/60
    hover:shadow-lg hover:shadow-emerald-500/25
    active:bg-emerald-600/30 active:scale-[0.98]
  `,
  secondary: `
    bg-transparent border border-white/20 text-white
    hover:bg-white/15 hover:border-white/40
    hover:shadow-lg hover:shadow-white/10
    active:bg-white/10 active:scale-[0.98]
  `,
  danger: `
    bg-red-600/20 border border-red-500/30 text-white
    hover:bg-red-500/40 hover:border-red-400/60
    hover:shadow-lg hover:shadow-red-500/25
    active:bg-red-600/30 active:scale-[0.98]
  `,
  ghost: `
    bg-transparent border-none text-white
    hover:bg-white/15 hover:shadow-lg hover:shadow-white/10
    active:bg-white/10 active:scale-[0.98]
  `
};

const ctaSizes = {
  sm: 'h-9 px-3 py-2 text-sm gap-1.5 min-w-[2.25rem] rounded-xl',
  md: 'h-12 px-4 py-3 text-base gap-2 min-w-[3rem] rounded-2xl',
  lg: 'h-14 px-6 py-4 text-lg gap-2.5 min-w-[3.5rem] rounded-2xl'
};

export const CTAButton: React.FC<CTAButtonProps> = ({
  children,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  onClick,
  className,
  title,
  'aria-label': ariaLabel,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={cn(
        // Base styles
        'relative overflow-hidden font-medium transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
        'flex items-center justify-center cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'whitespace-nowrap backdrop-blur-md',
        
        // Variant styles
        ctaVariants[variant],
        
        // Size styles
        ctaSizes[size],
        
        // Width modifier
        fullWidth && 'w-full',
        
        // Custom class
        className
      )}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      title={title}
      aria-label={ariaLabel}
      style={{
        textShadow: variant === 'primary' ? '0 0 8px rgba(0, 163, 108, 0.6)' : 'none'
      }}
      {...props}
    >
      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-center whitespace-nowrap overflow-hidden">
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
            {children && <span className="truncate">{children}</span>}
          </>
        )}
      </div>
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-inherit" />
      
      {/* Hover glow effect */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 via-emerald-400/0 to-emerald-600/0 opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-inherit" />
      )}
      
      {/* Focus/hover border enhancement */}
      <div className="absolute inset-0 rounded-inherit border border-transparent hover:border-white/10 transition-colors duration-300" />
    </motion.button>
  );
};

// Usage Examples Component
export const CTAButtonExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      {/* Quick Actions Example */}
      <div className="space-y-4">
        <h3 className="text-white font-bold">Quick Actions (Dashboard)</h3>
        <div className="space-y-3 max-w-xs">
          <CTAButton variant="primary" fullWidth>
            🔍 Cihaz Tara
          </CTAButton>
          <CTAButton variant="secondary" fullWidth>
            📡 Ağ Keşfi
          </CTAButton>
          <CTAButton variant="secondary" fullWidth>
            📊 Rapor
          </CTAButton>
          <CTAButton variant="danger" fullWidth>
            🚫 Engelle
          </CTAButton>
        </div>
      </div>

      {/* Table Actions Example */}
      <div className="space-y-4">
        <h3 className="text-white font-bold">Table Actions</h3>
        <div className="flex items-center gap-1">
          <CTAButton size="sm" className="table-action-button action-edit" title="Düzenle">
            ✏️
          </CTAButton>
          <CTAButton size="sm" className="table-action-button action-block" title="Engelle">
            🚫
          </CTAButton>
          <CTAButton size="sm" className="table-action-button action-delete" title="Sil">
            🗑️
          </CTAButton>
        </div>
      </div>

      {/* Size Variations */}
      <div className="space-y-4">
        <h3 className="text-white font-bold">Size Variations</h3>
        <div className="flex items-center gap-3">
          <CTAButton size="sm">📱 Küçük</CTAButton>
          <CTAButton size="md">💻 Orta</CTAButton>
          <CTAButton size="lg">🖥️ Büyük</CTAButton>
        </div>
      </div>

      {/* Loading States */}
      <div className="space-y-4">
        <h3 className="text-white font-bold">Loading States</h3>
        <div className="flex items-center gap-3">
          <CTAButton isLoading>Yükleniyor...</CTAButton>
          <CTAButton variant="secondary" isLoading>İşleniyor...</CTAButton>
        </div>
      </div>
    </div>
  );
};