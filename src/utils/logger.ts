class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logData = data ? ` | Data: ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${logData}`;
  }

  info(message: string, data?: any) {
    const formattedMessage = this.formatMessage('info', message, data);
    console.info(formattedMessage);
    
    // In production, send to logging service
    if (!this.isDevelopment) {
      this.sendToLoggingService('info', message, data);
    }
  }

  warn(message: string, data?: any) {
    const formattedMessage = this.formatMessage('warn', message, data);
    console.warn(formattedMessage);
    
    if (!this.isDevelopment) {
      this.sendToLoggingService('warn', message, data);
    }
  }

  error(message: string, error?: any) {
    const formattedMessage = this.formatMessage('error', message, error);
    console.error(formattedMessage);
    
    if (!this.isDevelopment) {
      this.sendToLoggingService('error', message, error);
    }
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage('debug', message, data);
      console.debug(formattedMessage);
    }
  }

  private sendToLoggingService(level: string, message: string, data?: any) {
    // Implement external logging service integration
    // e.g., send to ELK stack, Datadog, or other logging platforms
  }
}

export const logger = new Logger();