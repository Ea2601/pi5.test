/**
 * Modular Navigation System
 * Dynamic navigation based on loaded modules
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useAppStore } from '../../store';
import { cn } from '../../lib/utils';
import { useAccessibility } from '../../hooks/ui/useAccessibility';
import { moduleRegistry } from '../../core/ModuleRegistry';
import { moduleManager } from '../../core/ModuleManager';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  order: number;
  moduleId?: string;
  badge?: string;
}

export const ModularNavigation: React.FC = () => {
  const { currentView, setCurrentView, isMenuCollapsed, toggleMenu } = useAppStore();
  const { isReducedMotion } = useAccessibility();
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [moduleStatuses, setModuleStatuses] = useState<Record<string, any>>({});

  useEffect(() => {
    // Build navigation from loaded modules
    const buildNavigation = async () => {
      const loadedModules = moduleManager.getAllModules();
      const baseItems: NavigationItem[] = [
        { id: 'dashboard', label: 'Panel', icon: 'LayoutDashboard', order: 0 }
      ];

      const moduleItems: NavigationItem[] = loadedModules
        .filter(module => module.manifest.tabConfig)
        .map(module => ({
          id: module.manifest.id.replace('-', ''),
          label: module.manifest.tabConfig!.label,
          icon: module.manifest.tabConfig!.icon,
          order: module.manifest.tabConfig!.order,
          moduleId: module.manifest.id
        }));

      // Add settings at the end
      baseItems.push({ id: 'settings', label: 'Ayarlar', icon: 'Settings', order: 99 });

      const allItems = [...baseItems, ...moduleItems].sort((a, b) => a.order - b.order);
      setNavigationItems(allItems);

      // Update module statuses
      const statuses: Record<string, any> = {};
      for (const module of loadedModules) {
        statuses[module.manifest.id] = module.getStatus();
      }
      setModuleStatuses(statuses);
    };

    buildNavigation();

    // Refresh navigation when modules change
    const interval = setInterval(buildNavigation, 5000);
    return () => clearInterval(interval);
  }, []);

  const getModuleHealth = (moduleId?: string): 'healthy' | 'degraded' | 'unhealthy' => {
    if (!moduleId) return 'healthy';
    return moduleStatuses[moduleId]?.health || 'healthy';
  };

  const NavigationItem: React.FC<{ item: NavigationItem }> = ({ item }) => {
    const IconComponent = Icons[item.icon as keyof typeof Icons] as React.ComponentType<any>;
    const isActive = currentView === item.id;
    const health = getModuleHealth(item.moduleId);
    
    return (
      <button
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
        <div className="relative">
          <IconComponent className="w-5 h-5 flex-shrink-0" />
          {/* Health indicator for modules */}
          {item.moduleId && (
            <div className={cn(
              "absolute -top-1 -right-1 w-2 h-2 rounded-full",
              health === 'healthy' ? "bg-emerald-400" :
              health === 'degraded' ? "bg-orange-400" : "bg-red-400"
            )} />
          )}
        </div>
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
  };

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
              <Icons.Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            {!isMenuCollapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-white font-bold text-lg text-balance">Pi5 Süpernode</h1>
                <p className="text-white/60 text-xs">Modüler Ağ Konsolu</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleMenu}
            className="absolute top-4 right-4 w-6 h-6 text-white/60 hover:text-white transition-colors touch-target"
            aria-label={isMenuCollapsed ? "Expand menu" : "Collapse menu"}
          >
            <Icons.Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1" role="navigation">
          {navigationItems.map((item) => (
            <NavigationItem key={item.id} item={item} />
          ))}
        </nav>

        {/* Module Status */}
        <div className="absolute bottom-4 left-2 right-2">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {!isMenuCollapsed && (
                <div>
                  <span className="text-white/80 text-sm block">Modüler Sistem</span>
                  <span className="text-white/60 text-xs">{navigationItems.length - 2} modül yüklü</span>
                </div>
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
        className="md:hidden fixed inset-y-0 left-0 w-80 bg-black/30 backdrop-blur-xl border-r border-white/10 z-40"
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
                <p className="text-white/60 text-xs">Modüler Ağ Konsolu</p>
              </div>
            </div>
            <button
              onClick={toggleMenu}
              className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white transition-colors touch-target"
              aria-label="Close menu"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Items */}
        <nav className="p-2 space-y-1">
          {navigationItems.map((item) => (
            <NavigationItem key={item.id} item={item} />
          ))}
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