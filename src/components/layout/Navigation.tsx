import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useAppStore, navigationItems } from '../../store';
import { cn } from '../../lib/utils';
import { useAccessibility } from '../../hooks/ui/useAccessibility';

export const Navigation: React.FC = () => {
  const { currentView, setCurrentView, isMenuCollapsed, toggleMenu } = useAppStore();
  const { isReducedMotion } = useAccessibility();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-black/20 backdrop-blur-md rounded-xl border border-white/10 touch-target"
        aria-label="Toggle navigation menu"
      >
        <Icons.Menu className="w-6 h-6 text-white" />
      </button>

      {/* Desktop Navigation */}
      <motion.div
        initial={!isReducedMotion ? { x: -100 } : {}}
        animate={{ x: 0 }}
        transition={{ duration: isReducedMotion ? 0 : 0.3 }}
        className={cn(
          "fixed left-0 top-0 h-full bg-black/30 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-40",
          "hidden md:block",
          isMenuCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="lucide lucide-cpu w-4 h-4 text-emerald-400">
                <rect width="16" height="16" x="4" y="4" rx="2"/>
                <rect width="6" height="6" x="9" y="9" rx="1"/>
                <path d="M15 2v2"/>
                <path d="M15 20v2"/>
                <path d="M2 15h2"/>
                <path d="M2 9h2"/>
                <path d="M20 15h2"/>
                <path d="M20 9h2"/>
                <path d="M9 2v2"/>
                <path d="M9 20v2"/>
              </svg>
            </div>
            {!isMenuCollapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-white font-bold text-lg text-balance">Pi5 Süpernode</h1>
                <p className="text-white/60 text-xs">Ağ Konsolu</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleMenu}
            className="absolute top-4 right-4 w-6 h-6 text-white/60 hover:text-white transition-colors touch-target"
            aria-label={isMenuCollapsed ? "Expand menu" : "Collapse menu"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" 
                 width="24" height="24" viewBox="0 0 24 24" 
                 fill="none" stroke="currentColor" strokeWidth="2" 
                 strokeLinecap="round" strokeLinejoin="round" 
                 className="lucide lucide-menu w-4 h-4">
              <line x1="4" x2="20" y1="12" y2="12"/>
              <line x1="4" x2="20" y1="6" y2="6"/>
              <line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1" role="navigation">
          {navigationItems.map((item) => {
            const IconComponent = Icons[item.icon as keyof typeof Icons] as React.ComponentType<any>;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
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
                aria-current={isActive ? 'page' : undefined}
                title={isMenuCollapsed ? item.label : undefined}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                {!isMenuCollapsed && (
                  <span className="font-medium text-left">{item.label}</span>
                )}
                {item.badge && !isMenuCollapsed && (
                  <span className="ml-auto bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs px-2 py-1 rounded-full flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="absolute bottom-4 left-2 right-2">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {!isMenuCollapsed && (
                <span className="text-white/80 text-sm">Sistem Çevrimiçi</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Navigation Overlay */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isMenuCollapsed ? '-100%' : 0 }}
        transition={{ duration: isReducedMotion ? 0 : 0.3 }}
        className={cn(
          "md:hidden fixed inset-y-0 left-0 w-80 bg-black/30 backdrop-blur-xl border-r border-white/10 z-40",
          "transform transition-transform duration-300"
        )}
      >
        {/* Mobile Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Icons.Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Pi5 Süpernode</h1>
                <p className="text-white/60 text-xs">Ağ Konsolu</p>
              </div>
            </div>
            <button
              onClick={toggleMenu}
             className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-white/60 hover:text-white transition-colors touch-target"
              aria-label="Close menu"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Items */}
        <nav className="p-2 space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = Icons[item.icon as keyof typeof Icons] as React.ComponentType<any>;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  toggleMenu(); // Close mobile menu after selection
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 touch-target",
                  "border border-transparent text-white/70 hover:text-white",
                  isActive && "bg-emerald-500/10 border-emerald-500/20 text-white backdrop-blur-sm shadow-lg shadow-emerald-500/20",
                  !isActive && "hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/10"
                )}
                style={{
                  textShadow: isActive ? '0 0 8px rgba(0, 163, 108, 0.6)' : 'none'
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </motion.div>

      {/* Mobile Backdrop */}
      {!isMenuCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: isReducedMotion ? 0 : 0.2 }}
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={toggleMenu}
        />
      )}
    </>
  );
};