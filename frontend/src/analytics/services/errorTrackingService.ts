/**
 * Сервис трекинга ошибок
 * Отслеживает ошибки приложения, их частоту, компоненты, браузеры
 */

import { ErrorData, TechnicalHealth } from '../types/analytics.types';

import storageService from '../../services/storageService';

class ErrorTrackingService {
  private errors: ErrorData[] = [];
  private maxErrors = 1000;

  /**
   * Записать ошибку
   */
  trackError(error: {
    error_message: string;
    error_type?: string;
    component?: string;
    stack_trace?: string;
    user_id?: string;
  }): void {
    const errorData: ErrorData = {
      error_id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error_message: error.error_message,
      error_type: error.error_type || 'unknown',
      component: error.component || 'unknown',
      browser: this.detectBrowser(),
      device_type: this.detectDevice(),
      frequency: 1,
      first_seen: Date.now(),
      last_seen: Date.now(),
      stack_trace: error.stack_trace
    };

    // Проверяем, есть ли уже такая ошибка
    const existingError = this.errors.find(
      e => e.error_message === error.error_message && e.component === error.component
    );

    if (existingError) {
      existingError.frequency++;
      existingError.last_seen = Date.now();
    } else {
      this.errors.push(errorData);
    }

    // Ограничиваем количество ошибок
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Отправляем на сервер
    this.sendErrorToServer(errorData);
  }

  /**
   * Получить техническое здоровье
   */
  getTechnicalHealth(): TechnicalHealth {
    const totalErrors = this.errors.reduce((sum, e) => sum + e.frequency, 0);
    const errorsByComponent: Record<string, number> = {};
    const errorsByBrowser: Record<string, number> = {};
    const errorsByDevice: Record<string, number> = {};

    this.errors.forEach(error => {
      errorsByComponent[error.component] = (errorsByComponent[error.component] || 0) + error.frequency;
      errorsByBrowser[error.browser] = (errorsByBrowser[error.browser] || 0) + error.frequency;
      errorsByDevice[error.device_type] = (errorsByDevice[error.device_type] || 0) + error.frequency;
    });

    // Вычисляем процент ошибок (относительно общего числа событий)
    // В реальности это должно быть из аналитики
    const errorRate = totalErrors > 0 ? (totalErrors / 10000) * 100 : 0;

    return {
      error_rate: Math.min(errorRate, 100),
      errors_by_component: errorsByComponent,
      errors_by_browser: errorsByBrowser,
      errors_by_device: errorsByDevice,
      performance_metrics: [],
      api_errors: []
    };
  }

  /**
   * Получить ошибки по компоненту
   */
  getErrorsByComponent(component: string): ErrorData[] {
    return this.errors.filter(e => e.component === component);
  }

  /**
   * Определить браузер
   */
  private detectBrowser(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }

  /**
   * Определить устройство
   */
  private detectDevice(): 'desktop' | 'mobile' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop';
    
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Отправить ошибку на сервер
   */
  private async sendErrorToServer(error: ErrorData): Promise<void> {
    try {
      const token = storageService.getItem('token');
      if (!token) return;

      await fetch('/api/analytics/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(error)
      });
    } catch (err) {
      console.error('Ошибка отправки ошибки на сервер:', err);
    }
  }

  /**
   * Очистить ошибки
   */
  clearErrors(): void {
    this.errors = [];
  }
}

export const errorTrackingService = new ErrorTrackingService();

// Глобальный обработчик ошибок
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorTrackingService.trackError({
      error_message: event.message,
      error_type: 'javascript',
      component: 'global',
      stack_trace: event.error?.stack
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorTrackingService.trackError({
      error_message: event.reason?.message || 'Unhandled promise rejection',
      error_type: 'promise_rejection',
      component: 'global',
      stack_trace: event.reason?.stack
    });
  });
}

