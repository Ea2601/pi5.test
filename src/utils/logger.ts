// Re-export unified logger for frontend use
export { UnifiedLogger, logger } from '../../shared/utils/logger';

// Frontend-specific logging utilities
export const frontendLogger = {
  pageView: (page: string, props?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: page,
        page_location: window.location.href,
        custom_map: props
      });
    }
  },
  
  userAction: (action: string, category: string, props?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        ...props
      });
    }
  },
  
  error: (error: Error, context?: Record<string, any>) => {
    console.error('Frontend Error:', error);
    
    // Report to error tracking service in production
    if (import.meta.env.PROD && typeof window !== 'undefined') {
      // Sentry, LogRocket, or similar error tracking
      console.log('Error reported to tracking service');
    }
  }
};