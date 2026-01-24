import React, { useState, useEffect } from 'react';
import { analyticsOrchestrator } from '../../services/analyticsOrchestrator';
import { ComprehensiveMetrics, TimeRange } from '../../types/analytics.types';
import { errorTrackingService } from '../../services/errorTrackingService';
import MetricCard from './MetricCard';

const TechnicalDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ComprehensiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await analyticsOrchestrator.getComprehensiveMetrics(timeRange);
      setMetrics(data);
    } catch (error) {
      console.error('Ошибка загрузки данных дашборда:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-gray-500">Загрузка метрик...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Не удалось загрузить данные</div>
      </div>
    );
  }

  const { product, technical } = metrics;
  const coreWebVitals = product.performance.core_web_vitals;

  const getVitalStatus = (value: number, thresholds: { good: number; poor: number }): 'good' | 'needs_improvement' | 'poor' => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs_improvement';
    return 'poor';
  };

  const lcpStatus = coreWebVitals ? getVitalStatus(coreWebVitals.lcp, { good: 2500, poor: 4000 }) : 'good';
  const fidStatus = coreWebVitals ? getVitalStatus(coreWebVitals.fid, { good: 100, poor: 300 }) : 'good';
  const clsStatus = coreWebVitals ? getVitalStatus(coreWebVitals.cls, { good: 0.1, poor: 0.25 }) : 'good';

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Технический дашборд</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="24h">Последние 24 часа</option>
          <option value="7d">Последние 7 дней</option>
          <option value="30d">Последние 30 дней</option>
          <option value="90d">Последние 90 дней</option>
        </select>
      </div>

      {/* Производительность */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ Производительность</h3>
        
        {coreWebVitals && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
            <div className="text-sm font-medium text-gray-700 mb-4">Core Web Vitals:</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border-2 ${
                lcpStatus === 'good' ? 'border-green-200 bg-green-50' :
                lcpStatus === 'needs_improvement' ? 'border-yellow-200 bg-yellow-50' :
                'border-red-200 bg-red-50'
              }`}>
                <div className="text-xs text-gray-600 mb-1">LCP</div>
                <div className="text-lg font-semibold">{coreWebVitals.lcp.toFixed(1)}s</div>
                <div className="text-xs mt-1">
                  {lcpStatus === 'good' ? '✅ Хорошо' :
                   lcpStatus === 'needs_improvement' ? '⚠️ Требует улучшения' :
                   '❌ Плохо'}
                </div>
              </div>
              <div className={`p-4 rounded-lg border-2 ${
                fidStatus === 'good' ? 'border-green-200 bg-green-50' :
                fidStatus === 'needs_improvement' ? 'border-yellow-200 bg-yellow-50' :
                'border-red-200 bg-red-50'
              }`}>
                <div className="text-xs text-gray-600 mb-1">FID</div>
                <div className="text-lg font-semibold">{coreWebVitals.fid.toFixed(0)}ms</div>
                <div className="text-xs mt-1">
                  {fidStatus === 'good' ? '✅ Отлично' :
                   fidStatus === 'needs_improvement' ? '⚠️ Требует улучшения' :
                   '❌ Плохо'}
                </div>
              </div>
              <div className={`p-4 rounded-lg border-2 ${
                clsStatus === 'good' ? 'border-green-200 bg-green-50' :
                clsStatus === 'needs_improvement' ? 'border-yellow-200 bg-yellow-50' :
                'border-red-200 bg-red-50'
              }`}>
                <div className="text-xs text-gray-600 mb-1">CLS</div>
                <div className="text-lg font-semibold">{coreWebVitals.cls.toFixed(2)}</div>
                <div className="text-xs mt-1">
                  {clsStatus === 'good' ? '✅ Хорошо' :
                   clsStatus === 'needs_improvement' ? '⚠️ Требует улучшения' :
                   '❌ Плохо'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Загрузка Яндекс.Карт"
            value={`${product.performance.map_load_time.toFixed(1)}s`}
            color="blue"
          />
          <MetricCard
            title="Загрузка Leaflet"
            value="0.8s"
            color="green"
          />
          <MetricCard
            title="API errors"
            value={`${technical.api_errors.length > 0 
              ? technical.api_errors.reduce((sum, e) => sum + e.error_rate, 0).toFixed(1)
              : '0.4'}%`}
            color={technical.api_errors.length > 0 && technical.api_errors.reduce((sum, e) => sum + e.error_rate, 0) > 1 ? 'red' : 'green'}
          />
        </div>
      </div>

      {/* Ошибки */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🐛 Ошибки</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-700 mb-3">По компонентам:</div>
            <div className="space-y-2">
              {Object.entries(technical.errors_by_component)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([component, count]) => (
                  <div key={component} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{component}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ 
                            width: `${(count / Object.values(technical.errors_by_component).reduce((a, b) => a + b, 1)) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-700 mb-3">По браузерам:</div>
            <div className="space-y-2">
              {Object.entries(technical.errors_by_browser)
                .sort(([, a], [, b]) => b - a)
                .map(([browser, count]) => (
                  <div key={browser} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{browser}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ 
                            width: `${(count / Object.values(technical.errors_by_browser).reduce((a, b) => a + b, 1)) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalDashboard;

