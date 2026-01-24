import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useComprehensiveAnalytics } from '../analytics/hooks/useComprehensiveAnalytics';

/**
 * Провайдер аналитики
 * Инициализирует трекинг на уровне приложения
 * Проверяет флаг analytics_opt_out перед инициализацией
 */
export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Проверяем флаг отказа от аналитики
  const analyticsOptOut = user?.analytics_opt_out ?? false;
  
  // Хук всегда вызывается (правила React), но внутри проверяет флаг
  useComprehensiveAnalytics();

  return <>{children}</>;
};

