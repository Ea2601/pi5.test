import winston from 'winston';
import path from 'path';

interface LoggerConfig {
  service: string;
  level?: string;
  logDir?: string;
}

export class SharedLogger {
  private static instances: Map<string, winston.Logger> = new Map();

  static getInstance(config: LoggerConfig): winston.Logger {
    const { service, level = 'info', logDir = 'logs' } = config;

    if (SharedLogger.instances.has(service)) {
      return SharedLogger.instances.get(service)!;
    }

    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          service,
          message,
          ...meta
        });
      })
    );

    const logger = winston.createLogger({
      level,
      format: logFormat,
      defaultMeta: { service },
      transports: [
        // Error log
        new winston.transports.File({
          filename: path.join(logDir, `${service}-error.log`),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        }),
        
        // Combined log
        new winston.transports.File({
          filename: path.join(logDir, `${service}.log`),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        }),
        
        // Application log
        new winston.transports.File({
          filename: path.join(logDir, 'application.log'),
          maxsize: 10485760, // 10MB
          maxFiles: 3,
          tailable: true
        })
      ],
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, `${service}-exceptions.log`)
        })
      ],
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, `${service}-rejections.log`)
        })
      ]
    });

    // Add console transport in development
    if (process.env.NODE_ENV !== 'production') {
      logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
          winston.format.printf(({ timestamp, level, service, message }) => {
            return `${timestamp} [${service}] ${level}: ${message}`;
          })
        )
      }));
    }

    // Store instance
    SharedLogger.instances.set(service, logger);
    
    return logger;
  }

  static getLogger(service: string): winston.Logger {
    const logger = SharedLogger.instances.get(service);
    if (!logger) {
      throw new Error(`Logger for service '${service}' not initialized. Call getInstance first.`);
    }
    return logger;
  }

  static closeAll(): void {
    SharedLogger.instances.forEach((logger) => {
      logger.close();
    });
    SharedLogger.instances.clear();
  }
}

// Helper function to create service-specific logger
export const createServiceLogger = (serviceName: string): winston.Logger => {
  return SharedLogger.getInstance({
    service: serviceName,
    level: process.env.LOG_LEVEL || 'info',
    logDir: process.env.LOG_DIR || 'logs'
  });
};