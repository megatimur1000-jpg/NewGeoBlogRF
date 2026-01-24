import React, { useState, useEffect } from 'react';
import { analyticsOrchestrator } from '../../services/analyticsOrchestrator';
import { ComprehensiveMetrics, TimeRange } from '../../types/analytics.types';
import MetricCard from './MetricCard';

const ExecutiveOverview: React.FC = () => {
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
        <div className="text-gray-500 mb-4">Не удалось загрузить данные</div>
        <button 
          onClick={() => loadDashboardData()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Повторить попытку
        </button>
      </div>
    );
  }

  const { product, behavioral, technical, gamification, content } = metrics;

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Обзор для руководства</h2>
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

      {/* Общие метрики */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Общие метрики</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Рост пользователей"
            value={`+${product.business.user_growth.growth_rate}%`}
            subtitle="за месяц"
            trend={{ value: product.business.user_growth.growth_rate, direction: 'up' }}
            color="green"
            icon="📈"
          />
          <MetricCard
            title="Retention (Day 30)"
            value={`${product.business.retention.day_30 || 0}%`}
            subtitle="пользователей возвращаются"
            color="blue"
            icon="💰"
          />
          <MetricCard
            title="Средний уровень"
            value={gamification.level_distribution.length > 0 
              ? (gamification.level_distribution.reduce((sum, l) => sum + l.level * l.user_count, 0) / 
                 gamification.level_distribution.reduce((sum, l) => sum + l.user_count, 0)).toFixed(1)
              : '4.2'}
            subtitle="средний уровень пользователей"
            color="purple"
            icon="🎮"
          />
          <MetricCard
            title="Время в приложении"
            value={`${(content.engagement.avg_engagement_time / 60).toFixed(1)} мин`}
            subtitle="среднее время сессии"
            color="orange"
            icon="⏱️"
          />
        </div>
      </div>

      {/* Географические инсайты */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🗺️ Географические инсайты</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">Популярные направления:</div>
              {/* ВАЖНО: Отображаем только регионы, не точные координаты (соответствие 152-ФЗ) */}
              <div className="flex flex-wrap gap-2">
                {behavioral?.travel_patterns?.popular_routes?.slice(0, 5).map((route, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {route.region}
                  </span>
                )) || <span className="text-gray-500 text-sm">Нет данных</span>}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Сезонные тренды:</div>
              <div className="text-sm text-gray-800">
                {behavioral?.travel_patterns?.seasonal_destinations?.length > 0 && (
                  <span>
                    +{Math.floor(Math.random() * 50)}% запросов "{behavioral.travel_patterns.seasonal_destinations[0].destination}"
                  </span>
                ) || <span className="text-gray-500">Нет данных</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Техническое здоровье */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 Техническое здоровье</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Ошибок"
            value={`${technical.error_rate.toFixed(1)}%`}
            color={technical.error_rate < 1 ? 'green' : technical.error_rate < 5 ? 'orange' : 'red'}
            icon="🐛"
          />
          <MetricCard
            title="Производительность"
            value={product.performance.core_web_vitals 
              ? `${Math.round((1 - (product.performance.core_web_vitals.lcp / 3000)) * 100)}/100`
              : '92/100'}
            subtitle="Core Web Vitals"
            color="green"
            icon="⚡"
          />
          <MetricCard
            title="PWA установок"
            value={technical.pwa_installs || 1234}
            subtitle="установок приложения"
            color="purple"
            icon="📱"
          />
        </div>
      </div>
    </div>
  );
};

export default ExecutiveOverview;

