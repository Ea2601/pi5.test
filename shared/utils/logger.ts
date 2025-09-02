// Unified Logger - Single Implementation for All Services
import winston from 'winston';
import { config } from '../config/environment';

export interface LogContext {
  service?: string;
  userId?: string;
  requestId?: string;
  sessionId?: string;
  [key: string]: any;
}

export class UnifiedLogger {
  private static instances: Map<string, winston.Logger> = new Map();

  static getInstance(serviceName: string): winston.Logger {
    if (UnifiedLogger.instances.has(serviceName)) {
      return UnifiedLogger.instances.get(serviceName)!;
    }

    const logger = UnifiedLogger.createLogger(serviceName);
    UnifiedLogger.instances.set(serviceName, logger);
    return logger;
  }

  private static createLogger(serviceName: string): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        const logEntry = {
          timestamp,
          level: level.toUpperCase(),
          service: service || serviceName,
          message,
          ...meta
        };
        return JSON.stringify(logEntry);
      })
    );

    const logger = winston.createLogger({
      level: config.LOG_LEVEL,
      format: logFormat,
      defaultMeta: { service: serviceName },
      transports: [
        // Error log
        new winston.transports.File({
          filename: `${config.LOG_DIR}/${serviceName}-error.log`,
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        }),
        
        // Combined log
        new winston.transports.File({
          filename: `${config.LOG_DIR}/${serviceName}.log`,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        }),
        
        // Application log (all services)
        new winston.transports.File({
          filename: `${config.LOG_DIR}/application.log`,
          maxsize: 10485760, // 10MB
          maxFiles: 3,
          tailable: true
        })
      ],
      exceptionHandlers: [
        new winston.transports.File({
          filename: `${config.LOG_DIR}/${serviceName}-exceptions.log`
        })
      ],
      rejectionHandlers: [
        new winston.transports.File({
          filename: `${config.LOG_DIR}/${serviceName}-rejections.log`
        })
      ]
    });

    // Add console transport in development
    if (config.NODE_ENV !== 'production') {
      logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
          winston.format.printf(({ timestamp, level, service, message, ...meta }) => {
            const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} [${service}] ${level}: ${message}${metaStr}`;
          })
        )
      }));
    }

    return logger;
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

// Export convenience logger for direct use
export const logger = UnifiedLogger.getInstance('pi5-supernode');