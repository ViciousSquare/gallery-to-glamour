type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private sessionId = this.generateSessionId();

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const entry = this.createLogEntry(level, message, data);

    // In development, log to console
    if (this.isDevelopment) {
      const logMethod = level === 'debug' ? 'debug' :
                       level === 'info' ? 'info' :
                       level === 'warn' ? 'warn' : 'error';

      console[logMethod](`[${level.toUpperCase()}] ${message}`, data || '');
    }

    // Send critical errors to analytics/monitoring
    if (level === 'error') {
      this.sendToAnalytics(entry);
    }

    // In production, you could send to a logging service
    if (!this.isDevelopment) {
      this.sendToLoggingService(entry);
    }
  }

  private async sendToAnalytics(entry: LogEntry): Promise<void> {
    try {
      const { analytics } = await import('../analytics');
      analytics.track('error_occurred', {
        message: entry.message,
        level: entry.level,
        url: entry.url,
        userAgent: entry.userAgent,
        timestamp: entry.timestamp,
      });
    } catch (error) {
      // Prevent infinite loop if analytics fails
      console.error('Failed to send error to analytics:', error);
    }
  }

  private sendToLoggingService(entry: LogEntry): void {
    // In a real application, you would send this to a service like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom logging endpoint

    // For now, we'll just store in localStorage for debugging
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(entry);

      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.shift();
      }

      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store log:', error);
    }
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | any): void {
    const errorData = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : error;

    this.log('error', message, errorData);
  }

  // Utility method to log API errors
  apiError(operation: string, error: any): void {
    this.error(`API Error: ${operation}`, {
      operation,
      error: error?.message || error,
      status: error?.status,
      url: error?.url,
    });
  }

  // Utility method to log user actions
  userAction(action: string, data?: any): void {
    this.info(`User Action: ${action}`, data);
  }

  // Get recent logs (for debugging)
  getRecentLogs(count: number = 50): LogEntry[] {
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      return logs.slice(-count);
    } catch {
      return [];
    }
  }

  // Clear logs
  clearLogs(): void {
    localStorage.removeItem('app_logs');
  }
}

export const logger = new Logger();