// Утилита для отладки фронтенда (отключена в production)
class DebugLogger {
  private static instance: DebugLogger;
  private isEnabled = process.env.NODE_ENV === 'development';

  private constructor() {}

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  private async sendToServer(level: string, message: string, data?: any) {
    if (!this.isEnabled) return;

    try {
      await fetch('/api/debug-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          data
        })
      });
    } catch (error) {
      // Silent fail in production
    }
  }

  info(message: string, data?: any) {
    if (this.isEnabled) {
      this.sendToServer('info', message, data);
    }
  }

  error(message: string, data?: any) {
    if (this.isEnabled) {
      this.sendToServer('error', message, data);
    }
  }

  warn(message: string, data?: any) {
    if (this.isEnabled) {
      this.sendToServer('warn', message, data);
    }
  }

  debug(message: string, data?: any) {
    if (this.isEnabled) {
      this.sendToServer('debug', message, data);
    }
  }

  // Специальный метод для отладки компонентов
  component(componentName: string, action: string, data?: any) {
    if (this.isEnabled) {
      this.info(`[${componentName}] ${action}`, data);
    }
  }
}

export const debugLogger = DebugLogger.getInstance();