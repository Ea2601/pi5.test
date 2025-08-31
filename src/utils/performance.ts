interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  bundleSize: number;
}

export const performanceMonitor = {
  measurePageLoad: () => {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      // Log to console in development
      if (import.meta.env.DEV) {
        console.log(`Page load time: ${loadTime}ms`);
      }
      
      // In production, send to analytics service
      if (import.meta.env.PROD) {
        // analytics.track('page_load_time', { duration: loadTime });
      }
    });
  },

  measureInteraction: (name: string, fn: () => void) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (import.meta.env.DEV) {
      console.log(`${name} took ${end - start}ms`);
    }
    
    return result;
  },

  measureRender: (componentName: string) => {
    return {
      start: () => performance.mark(`${componentName}-render-start`),
      end: () => {
        performance.mark(`${componentName}-render-end`);
        performance.measure(
          `${componentName}-render`,
          `${componentName}-render-start`,
          `${componentName}-render-end`
        );
      }
    };
  },

  getMetrics: (): PerformanceMetrics | null => {
    if (typeof window === 'undefined') return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      renderTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      interactionTime: navigation.domInteractive - navigation.domLoading,
      bundleSize: 0 // Would be calculated by build process
    };
  }
};

// Initialize performance monitoring
performanceMonitor.measurePageLoad();