/**
 * React Hook для комплексной аналитики
 * Предоставляет методы трекинга и автоматический трекинг страниц
 */

import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsOrchestrator } from '../services/analyticsOrchestrator';
import { performanceMonitoringService } from '../services/performanceMonitoringService';
import { errorTrackingService } from '../services/errorTrackingService';
import { UserJourneyEvent, MapBehaviorEvent } from '../types/analytics.types';
import { isAnalyticsEnabled } from '../utils/analyticsConsent';

let previousPath = '';
let timeOnPreviousPage = 0;
let pageStartTime = Date.now();

export const useComprehensiveAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();

  /**
   * Универсальный метод трекинга
   * Проверяет флаг analytics_opt_out перед трекингом
   */
  const track = useCallback((event: string, properties: Record<string, any> = {}) => {
    // Проверяем согласие на аналитику
    if (!isAnalyticsEnabled(user)) {
      // Аналитика отключена - молча игнорируем
      return;
    }

    const userJourneyEvent: UserJourneyEvent = {
      user_id: undefined, // Будет добавлено из контекста при необходимости
      event_type: event,
      timestamp: Date.now(),
      properties,
      session_id: analyticsOrchestrator['getSessionId']()
    };

    analyticsOrchestrator.trackUserJourney(userJourneyEvent);
  }, []);

  /**
   * Трекинг паттерна путешествия
   */
  const trackTravelPattern = useCallback((pattern: {
    route_id?: string;
    region?: string;
    complexity?: string;
    seasonality?: string[];
  }) => {
    track('travel_pattern_identified', pattern);
  }, [track]);

  /**
   * Трекинг предпочтений контента
   */
  const trackContentPreference = useCallback((preference: {
    content_type: string;
    preference_type: string;
    value: any;
  }) => {
    track('content_preference_updated', preference);
  }, [track]);

  /**
   * Трекинг взаимодействия с картой
   */
  const trackMapInteraction = useCallback((interaction: {
    type: 'zoom' | 'pan' | 'marker_click' | 'route_planned' | 'layer_change';
    properties?: Record<string, any>;
  }) => {
    const mapEvent: MapBehaviorEvent = {
      event_type: interaction.type,
      timestamp: Date.now(),
      properties: interaction.properties || {},
      session_id: analyticsOrchestrator['getSessionId']()
    };

    analyticsOrchestrator.trackMapBehavior(mapEvent);
  }, []);

  /**
   * Автоматический трекинг страниц
   * Проверяет флаг analytics_opt_out перед трекингом
   */
  useEffect(() => {
    // Проверяем согласие на аналитику
    if (!isAnalyticsEnabled(user)) {
      // Аналитика отключена - не трекаем страницы
      return;
    }

    const currentPath = location.pathname;
    const currentTime = Date.now();
    
    // Вычисляем время на предыдущей странице
    if (previousPath && previousPath !== currentPath) {
      timeOnPreviousPage = currentTime - pageStartTime;
    }

    // Трекинг просмотра страницы
    analyticsOrchestrator.trackPageView(
      currentPath,
      previousPath || undefined,
      timeOnPreviousPage || undefined
    );

    // Обновляем данные для следующей страницы
    previousPath = currentPath;
    pageStartTime = currentTime;
  }, [location.pathname, user]);

  /**
   * Трекинг производительности
   */
  useEffect(() => {
    // Измеряем время загрузки приложения при первой загрузке
    if (performance.now() < 5000) {
      const appLoadTime = performanceMonitoringService.measureAppLoadTime();
      if (appLoadTime > 0) {
        performanceMonitoringService.trackUserTiming({
          event_type: 'app_load',
          duration: appLoadTime,
          component: 'App'
        });
      }
    }
  }, []);

  /**
   * Трекинг ошибок через глобальный обработчик
   */
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      errorTrackingService.trackError({
        error_message: event.message,
        error_type: 'javascript',
        component: 'global',
        stack_trace: event.error?.stack
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      errorTrackingService.trackError({
        error_message: event.reason?.message || 'Unhandled promise rejection',
        error_type: 'promise_rejection',
        component: 'global',
        stack_trace: event.reason?.stack
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return {
    track,
    trackTravelPattern,
    trackContentPreference,
    trackMapInteraction
  };
};

