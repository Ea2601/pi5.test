/**
 * Unified Logger - Shared logging utility for all modules
 */

export class UnifiedLogger {
  private static instances = new Map<string, UnifiedLogger>();
  private namespace: string;

  private constructor(namespace: string) {
    this.namespace = namespace;
  }

  static getInstance(namespace: string = 'default'): UnifiedLogger {
    if (!UnifiedLogger.instances.has(namespace)) {
      UnifiedLogger.instances.set(namespace, new UnifiedLogger(namespace));
    }
    return UnifiedLogger.instances.get(namespace)!;
  }

  private formatMessage(level: string, message: string, meta?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${this.namespace}] ${level.toUpperCase()}: ${message}${metaString}`;
  }

  info(message: string, meta?: Record<string, any>): void {
    console.log(this.formatMessage('info', message, meta));
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('debug', message, meta));
    }
  }

  warn(message: string, meta?: Record<string, any>): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  error(message: string, meta?: Record<string, any>): void {
    console.error(this.formatMessage('error', message, meta));
  }
}