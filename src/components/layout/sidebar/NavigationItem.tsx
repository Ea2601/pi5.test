import React from 'react';
import * as Icons from 'lucide-react';
import { cn } from '../../../lib/utils';
import { NavigationItem as NavItem } from '../../../types/ui';

interface NavigationItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  isActive,
  isCollapsed,
  onClick
}) => {
  const IconComponent = Icons[item.icon as keyof typeof Icons] as React.ComponentType<any>;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 touch-target",
        "border border-transparent text-white/70 hover:text-white",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
        isActive && "bg-emerald-500/10 border-emerald-500/20 text-white backdrop-blur-sm shadow-lg shadow-emerald-500/20",
        !isActive && "hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/10"
      )}
      style={{
        textShadow: isActive ? '0 0 8px rgba(0, 163, 108, 0.6)' : 'none'
      }}
      title={isCollapsed ? item.label : undefined}
    >
      <IconComponent className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && (
        <span className="font-medium text-left">{item.label}</span>
      )}
      {item.badge && !isCollapsed && (
        <span className="ml-auto bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs px-2 py-1 rounded-full flex-shrink-0">
          {item.badge}
        </span>
      )}
    </button>
  );
};