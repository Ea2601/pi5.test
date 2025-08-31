import React from 'react';
import { motion } from 'framer-motion';
import { getIcon } from '../../shared/icons/iconMap';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface Control {
  id: string;
  type: 'toggle' | 'slider' | 'select' | 'input' | 'button';
  label: string;
  value?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
  action?: (value: any) => void;
  icon?: string;
}

interface ControlCardProps {
  title: string;
  controls: Control[];
  className?: string;
}

export const ControlCard: React.FC<ControlCardProps> = ({ 
  title,
  controls = [],
  className
}) => {
  const validControls = Array.isArray(controls) ? controls : [];

  return (
    <Card title={title} className={cn('space-y-4', className)}>
      {validControls.length === 0 ? (
        <div className="text-center py-4 text-white/50">
          Henüz kontrol bulunmuyor
        </div>
      ) : (
        <div className="space-y-3">
          {validControls.map((control) => {
            const IconComponent = getIcon(control.icon);
            
            return (
              <div key={control.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <IconComponent className="w-4 h-4 text-emerald-400" />
                  <span className="text-white text-sm">{control.label}</span>
                </div>
                <div className="flex items-center">
                  {control.type === 'toggle' && (
                    <button
                      onClick={() => control.action?.(!control.value)}
                      className={cn(
                        "relative w-10 h-5 rounded-full transition-all duration-300",
                        control.value 
                          ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                          : "bg-white/20"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                          control.value ? "left-5" : "left-0.5"
                        )}
                      />
                    </button>
                  )}
                  
                  {control.type === 'slider' && (
                    <div className="flex items-center gap-2 w-32">
                      <input
                        type="range"
                        min={control.min ?? 0}
                        max={control.max ?? 100}
                        step={control.step ?? 1}
                        value={control.value ?? 0}
                        onChange={(e) => control.action?.(parseInt(e.target.value))}
                        className="flex-1 h-1 bg-white/20 rounded-lg appearance-none slider"
                      />
                      <span className="text-white text-xs font-mono w-8 text-right">
                        {control.value ?? 0}
                      </span>
                    </div>
                  )}
                  
                  {control.type === 'select' && (
                    <select
                      value={control.value ?? ''}
                      onChange={(e) => control.action?.(e.target.value)}
                      className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-emerald-500/50"
                    >
                      {control.options?.map((option) => (
                        <option key={option.value} value={option.value} className="bg-gray-800">
                          {option.label || option.value}
                        </option>
                      )) ?? []}
                    </select>
                  )}
                  
                  {control.type === 'input' && (
                    <input
                      type="text"
                      value={control.value ?? ''}
                      onChange={(e) => control.action?.(e.target.value)}
                      className="px-2 py-1 w-24 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-emerald-500/50"
                    />
                  )}
                  
                  {control.type === 'button' && (
                    <Button
                      size="sm"
                      onClick={() => control.action?.(control.value)}
                      className="whitespace-nowrap"
                    >
                      {control.label || 'Tıkla'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};