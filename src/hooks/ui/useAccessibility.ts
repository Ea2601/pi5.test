import { useState, useEffect } from 'react';

export interface AccessibilityConfig {
  isReducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'normal' | 'large';
  keyboardNavigation: boolean;
}

export const useAccessibility = () => {
  const [config, setConfig] = useState<AccessibilityConfig>({
    isReducedMotion: false,
    highContrast: false,
    fontSize: 'normal',
    keyboardNavigation: false
  });

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setConfig(prev => ({ ...prev, isReducedMotion: mediaQuery.matches }));
    
    const handleChange = () => {
      setConfig(prev => ({ ...prev, isReducedMotion: mediaQuery.matches }));
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setConfig(prev => ({ ...prev, highContrast: contrastQuery.matches }));
    
    const handleContrastChange = () => {
      setConfig(prev => ({ ...prev, highContrast: contrastQuery.matches }));
    };
    
    contrastQuery.addEventListener('change', handleContrastChange);

    // Detect keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setConfig(prev => ({ ...prev, keyboardNavigation: true }));
      }
    };

    const handleMouseDown = () => {
      setConfig(prev => ({ ...prev, keyboardNavigation: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const updateConfig = (updates: Partial<AccessibilityConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return {
    config,
    updateConfig,
    isReducedMotion: config.isReducedMotion,
    highContrast: config.highContrast,
    fontSize: config.fontSize,
    keyboardNavigation: config.keyboardNavigation
  };
};