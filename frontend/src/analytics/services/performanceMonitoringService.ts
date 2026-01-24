/**
 * Сервис мониторинга производительности
 * Отслеживает производительность приложения, время загрузки, Core Web Vitals
 */

import { PerformanceData, MapBehaviorEvent } from '../types/analytics.types';

class PerformanceMonitoringService {
  private metrics: PerformanceData[] = [];
  private mapPerformanceCache: Map<string, number> = new Map();

  /**
   * Трекинг времени пользователя
   */
  trackUserTiming(event: {
    event_type: string;
    duration: number;
    component?: string;
  }): void {
    const metric: PerformanceData = {
      metric_name: event.event_type,
      value: event.duration,
      threshold: this.getThreshold(event.event_type),
      status: this.getStatus(event.duration, event.event_type),
      component: event.component,
      timestamp: Date.now()
    };

    this.metrics.push(metric);
    
    // Храним только последние 100 метрик
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Получить производительность карты
   */
  getMapPerformance(mapEvent: MapBehaviorEvent): {
    load_time?: number;
    interaction_latency?: number;
  } {
    const cacheKey = `${mapEvent.event_type}_${mapEvent.session_id}`;
    const cached = this.mapPerformanceCache.get(cacheKey);
    
    return {
      interaction_latency: cached || undefined
    };
  }

  /**
   * Измерить время загрузки приложения
   */
  measureAppLoadTime(): number {
    if (typeof window === 'undefined' || !window.performance) {
      return 0;
    }

    const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      return navigation.loadEventEnd - navigation.fetchStart;
    }

    return 0;
  }

  /**
   * Измерить время загрузки карты
   */
  measureMapLoadTime(): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      // Симулируем измерение времени загрузки карты
      // В реальности это должно быть привязано к событию загрузки карты
      setTimeout(() => {
        const loadTime = performance.now() - startTime;
        this.trackUserTiming({
          event_type: 'map_load',
          duration: loadTime,
          component: 'MapComponent'
        });
        resolve(loadTime);
      }, 100);
    });
  }

  /**
   * Получить Core Web Vitals
   */
  async getCoreWebVitals(): Promise<{
    lcp?: number;
    fid?: number;
    cls?: number;
  }> {
    if (typeof window === 'undefined') {
      return {};
    }

    const vitals: any = {};

    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Не поддерживается
      }
    }

    // FID (First Input Delay)
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            vitals.fid = entry.processingStart - entry.startTime;
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // Не поддерживается
      }
    }

    // CLS (Cumulative Layout Shift)
    if ('PerformanceObserver' in window) {
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          vitals.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Не поддерживается
      }
    }

    return vitals;
  }

  /**
   * Получить порог для метрики
   */
  private getThreshold(metricName: string): number {
    const thresholds: Record<string, number> = {
      'app_load': 3000,
      'map_load': 2000,
      'page_load': 3000,
      'api_request': 1000
    };
    return thresholds[metricName] || 1000;
  }

  /**
   * Определить статус производительности
   */
  private getStatus(value: number, metricName: string): 'good' | 'needs_improvement' | 'poor' {
    const threshold = this.getThreshold(metricName);
    const goodThreshold = threshold * 0.7;
    const poorThreshold = threshold * 1.5;

    if (value <= goodThreshold) return 'good';
    if (value <= poorThreshold) return 'needs_improvement';
    return 'poor';
  }

  /**
   * Получить все метрики производительности
   */
  getPerformanceMetrics(): PerformanceData[] {
    return [...this.metrics];
  }

  /**
   * Очистить метрики
   */
  clearMetrics(): void {
    this.metrics = [];
    this.mapPerformanceCache.clear();
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService();

