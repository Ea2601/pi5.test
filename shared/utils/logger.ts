// Unified Logger - Browser and Node.js Compatible
export interface LogContext {
  service?: string;
  userId?: string;
  requestId?: string;
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

  static logError(serviceName: string, error: Error, context?: LogContext) {
    const logger = UnifiedLogger.getInstance(serviceName);
    logger.error(error.message, {
      stack: error.stack,
      ...context
    });
  }
}

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
    console.debug(this.formatMessage('debug', message, meta));
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
}

export const logger = UnifiedLogger.getInstance('pi5-supernode');