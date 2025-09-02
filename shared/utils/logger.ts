// Unified Logger - Single Implementation for All Services

export interface LogContext {
  service?: string;
  userId?: string;
  requestId?: string;
  sessionId?: string;
  [key: string]: any;
}

export class UnifiedLogger {
  private static instances: Map<string, Logger> = new Map();

  static getInstance(serviceName: string): Logger {
    if (UnifiedLogger.instances.has(serviceName)) {
      return UnifiedLogger.instances.get(serviceName)!;
    }

    const logger = UnifiedLogger.createLogger(serviceName);
    UnifiedLogger.instances.set(serviceName, logger);
    return logger;
  }

  private static createLogger(serviceName: string): Logger {
    return new Logger(serviceName);
  }

  // Convenience methods for common logging patterns
  static logApiRequest(serviceName: string, method: string, path: string, context?: LogContext) {
    const logger = UnifiedLogger.getInstance(serviceName);
    logger.info(`API Request: ${method} ${path}`, context);
  }

  static logApiResponse(serviceName: string, method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    const logger = UnifiedLogger.getInstance(serviceName);
    logger.info(`API Response: ${method} ${path} - ${statusCode} (${duration}ms)`, context);
  }

  static logDatabaseQuery(serviceName: string, query: string, duration: number, rowCount?: number) {
    const logger = UnifiedLogger.getInstance(serviceName);
    logger.debug('Database Query', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      duration,
      rowCount
    });
  }

  static logError(serviceName: string, error: Error, context?: LogContext) {
    const logger = UnifiedLogger.getInstance(serviceName);
    logger.error(error.message, {
      stack: error.stack,
      ...context
    });
  }

  static logPerformance(serviceName: string, operation: string, duration: number, context?: LogContext) {
    const logger = UnifiedLogger.getInstance(serviceName);
    
    if (duration > 1000) {
      logger.warn(`Slow operation detected: ${operation} took ${duration}ms`, context);
    } else {
      logger.debug(`Performance: ${operation} completed in ${duration}ms`, context);
    }
  }

  static logSecurityEvent(serviceName: string, event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext) {
    const logger = UnifiedLogger.getInstance(serviceName);
    logger.warn(`Security Event [${severity.toUpperCase()}]: ${event}`, context);
  }
}

// Browser and Node.js compatible Logger class
class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${this.serviceName}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  debug(message: string, meta?: any) {
    if (typeof window !== 'undefined') {
      console.debug(this.formatMessage('debug', message, meta));
    } else {
      // In Node.js environment, you can add file logging here
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  info(message: string, meta?: any) {
    console.info(this.formatMessage('info', message, meta));
  }

  warn(message: string, meta?: any) {
    console.warn(this.formatMessage('warn', message, meta));
  }

  error(message: string, meta?: any) {
    console.error(this.formatMessage('error', message, meta));
  }

  log(level: string, message: string, meta?: any) {
    switch (level) {
      case 'debug':
        this.debug(message, meta);
        break;
      case 'info':
        this.info(message, meta);
        break;
      case 'warn':
        this.warn(message, meta);
        break;
      case 'error':
        this.error(message, meta);
        break;
      default:
        this.info(message, meta);
    }
  }
}

// Export convenience logger for direct use
export const logger = UnifiedLogger.getInstance('pi5-supernode');

  // Convenience methods for common logging patterns
  static logApiRequest(serviceName: string, method: string, path: string, context?: LogContext) {
    const logger = UnifiedLogger.getInstance(serviceName);
    logger.info(`API Request: ${method} ${path}`, context);
  }

  static logApiResponse(serviceName: string, method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    const logger = UnifiedLogger.getInstance(serviceName);
    logger.info(`API Response: ${method} ${path} - ${statusCode} (${duration}ms)`, context);
  }

  static logDatabaseQuery(serviceName: string, query: string, duration: number, rowCount?: number) {
    const logger = UnifiedLogger.getInstance(serviceName);
    logger.debug('Database Query', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      duration,
      rowCount
    });
  }

  static logError(serviceName: string, error: Error, context?: LogContext) {
    const logger = UnifiedLogger.getInstance(serviceName);
    logger.error(error.message, {
      stack: error.stack,
      ...context
    });
  }

  static logPerformance(serviceName: string, operation: string, duration: number, context?: LogContext) {
    const logger = UnifiedLogger.getInstance(serviceName);
    
    if (duration > 1000) {
      logger.warn(`Slow operation detected: ${operation} took ${duration}ms`, context);
    } else {
      logger.debug(`Performance: ${operation} completed in ${duration}ms`, context);
    }
  }

  static logSecurityEvent(serviceName: string, event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext) {
    const logger = UnifiedLogger.getInstance(serviceName);
    logger.warn(`Security Event [${severity.toUpperCase()}]: ${event}`, context);
  }
}

// Export convenience logger for direct use
export const logger = UnifiedLogger.getInstance('pi5-supernode');