import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { MetricCardProps } from '../ui/types';

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  status = 'ok',
  isDragging
}) => {
  const IconComponent = icon ? Icons[icon as keyof typeof Icons] as React.ComponentType<any> : null;
  
  const statusColors = {
    ok: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    warn: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    error: 'text-red-400 bg-red-500/10 border-red-500/20'
  };

  const trendIcons = {
    up: Icons.TrendingUp,
    down: Icons.TrendingDown,
    stable: Icons.Minus
  };

  const TrendIcon = trend ? trendIcons[trend] : null;

  return (
    <Card isDragging={isDragging} className="h-40 hover:border-white/20" hoverable>
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            {IconComponent && (
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", statusColors[status])}>
                <div className="flex items-center">
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>
            )}
            <h3 className="text-white font-medium text-sm text-balance">{title}</h3>
          </div>
          
          <div className="space-y-1 flex-1 flex flex-col justify-center">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-white"
            >
              {value}
            </motion.div>
            
            {subtitle && (
              <p className="text-white/70 text-xs text-balance">{subtitle}</p>
            )}
            
            {trend && trendValue && TrendIcon && (
              <div className="flex items-center gap-1 mt-auto">
                <TrendIcon className={cn(
                  "w-3 h-3",
                  trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/60'
                )} />
                <span className={cn(
                  "text-xs",
                  trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/60'
                )}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};