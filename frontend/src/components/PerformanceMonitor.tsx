import React, { useState, useEffect, useCallback } from 'react';
import useServiceWorker from '../hooks/useServiceWorker';

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { isSupported, isInstalled, isActive, clearCache } = useServiceWorker();

  const measurePerformance = useCallback(() => {
    if ('PerformanceObserver' in window) {
      // FCP
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries[entries.length - 1];
        if (fcp) {
          setMetrics(prev => ({ ...prev, fcp: fcp.startTime } as PerformanceMetrics));
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1];
        if (lcp) {
          setMetrics(prev => ({ ...prev, lcp: lcp.startTime } as PerformanceMetrics));
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fid = entries[entries.length - 1];
        if (fid) {
          setMetrics(prev => ({ ...prev, fid: (fid as any).processingStart - fid.startTime } as PerformanceMetrics));
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS
      const clsObserver = new PerformanceObserver((list) => {
        let cls = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        }
        setMetrics(prev => ({ ...prev, cls } as PerformanceMetrics));
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // TTFB
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        setMetrics(prev => ({ ...prev, ttfb } as PerformanceMetrics));
      }
    }
  }, []);

  const getPerformanceScore = useCallback((metric: keyof PerformanceMetrics, value: number): string => {
    const thresholds = {
      fcp: { good: 1800, needsImprovement: 3000 },
      lcp: { good: 2500, needsImprovement: 4000 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      ttfb: { good: 800, needsImprovement: 1800 }
    };

    const { good, needsImprovement } = thresholds[metric];
    
    if (value <= good) return '🟢 Отлично';
    if (value <= needsImprovement) return '🟡 Хорошо';
    return '🔴 Требует улучшения';
  }, []);

  useEffect(() => {
    measurePerformance();
  }, [measurePerformance]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Монитор производительности"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📊 Производительность</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium text-gray-700 mb-2">Service Worker</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Поддержка:</span>
            <span className={isSupported ? 'text-green-600' : 'text-red-600'}>
              {isSupported ? '✅' : '❌'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Установлен:</span>
            <span className={isInstalled ? 'text-green-600' : 'text-yellow-600'}>
              {isInstalled ? '✅' : '⏳'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Активен:</span>
            <span className={isActive ? 'text-green-600' : 'text-yellow-600'}>
              {isActive ? '✅' : '⏳'}
            </span>
          </div>
        </div>
        {isInstalled && (
          <button
            onClick={clearCache}
            className="mt-2 w-full px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
          >
            Очистить кэш
          </button>
        )}
      </div>

      {metrics && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Метрики</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>FCP:</span>
              <span className="font-mono">
                {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : '—'}
              </span>
            </div>
            {metrics.fcp && (
              <div className="text-xs text-gray-500">
                {getPerformanceScore('fcp', metrics.fcp)}
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>LCP:</span>
              <span className="font-mono">
                {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : '—'}
              </span>
            </div>
            {metrics.lcp && (
              <div className="text-xs text-gray-500">
                {getPerformanceScore('lcp', metrics.lcp)}
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>FID:</span>
              <span className="font-mono">
                {metrics.fid ? `${Math.round(metrics.fid)}ms` : '—'}
              </span>
            </div>
            {metrics.fid && (
              <div className="text-xs text-gray-500">
                {getPerformanceScore('fid', metrics.fid)}
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>CLS:</span>
              <span className="font-mono">
                {metrics.cls ? metrics.cls.toFixed(3) : '—'}
              </span>
            </div>
            {metrics.cls && (
              <div className="text-xs text-gray-500">
                {getPerformanceScore('cls', metrics.cls)}
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>TTFB:</span>
              <span className="font-mono">
                {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : '—'}
              </span>
            </div>
            {metrics.ttfb && (
              <div className="text-xs text-gray-500">
                {getPerformanceScore('ttfb', metrics.ttfb)}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={measurePerformance}
        className="mt-4 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
      >
        🔄 Обновить метрики
      </button>
    </div>
  );
};

export default PerformanceMonitor;

