// Frontend-specific logging utilities
const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.log(`[INFO] ${message}`, meta || '');
  },
  error: (message: string, meta?: Record<string, any>) => {
    console.error(`[ERROR] ${message}`, meta || '');
  },
  warn: (message: string, meta?: Record<string, any>) => {
    console.warn(`[WARN] ${message}`, meta || '');
  },
  debug: (message: string, meta?: Record<string, any>) => {
    console.debug(`[DEBUG] ${message}`, meta || '');
  }
};

export { logger };

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