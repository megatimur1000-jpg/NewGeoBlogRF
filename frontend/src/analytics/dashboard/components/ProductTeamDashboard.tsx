import React, { useState, useEffect } from 'react';
import { analyticsOrchestrator } from '../../services/analyticsOrchestrator';
import { ComprehensiveMetrics, TimeRange } from '../../types/analytics.types';
import MetricCard from './MetricCard';

const ProductTeamDashboard: React.FC = () => {
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

  const { gamification, content } = metrics;

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Дашборд команды продукта</h2>
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

      {/* Геймификация */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎮 Геймификация</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <MetricCard
            title="Daily Goals completion"
            value={`${gamification.daily_goals_completion}%`}
            color="green"
          />
          <MetricCard
            title="Achievement unlock rate"
            value={`${gamification.achievement_unlock_rate}%`}
            color="purple"
          />
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="text-sm font-medium text-gray-700 mb-3">XP sources:</div>
          <div className="space-y-2">
            {gamification.xp_sources.map((source, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{source.source}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">
                    {source.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {gamification.problem_areas.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm font-medium text-yellow-800 mb-2">⚠️ Проблемные места:</div>
            <ul className="space-y-1">
              {gamification.problem_areas.map((area, idx) => (
                <li key={idx} className="text-sm text-yellow-700">
                  • {area.issue} ({area.affected_users_percentage}% пользователей)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Контент */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Контент</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <MetricCard
            title="Постов с фото"
            value={`${content.quality.posts_with_photos}%`}
            trend={content.quality.trends.find(t => t.metric === 'Посты с фото') ? {
              value: content.quality.trends.find(t => t.metric === 'Посты с фото')!.change,
              direction: content.quality.trends.find(t => t.metric === 'Посты с фото')!.direction
            } : undefined}
            color="green"
          />
          <MetricCard
            title="Детальных описаний"
            value={`${content.quality.detailed_descriptions}%`}
            trend={content.quality.trends.find(t => t.metric === 'Детальные описания') ? {
              value: content.quality.trends.find(t => t.metric === 'Детальные описания')!.change,
              direction: content.quality.trends.find(t => t.metric === 'Детальные описания')!.direction
            } : undefined}
            color="orange"
          />
          <MetricCard
            title="Повторного использования"
            value={`${content.quality.reuse_rate}%`}
            color="blue"
          />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-700 mb-3">Вовлеченность:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-600">Лайки/просмотры</div>
              <div className="text-lg font-semibold text-gray-900">{content.engagement.likes_per_view}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Шеринг</div>
              <div className="text-lg font-semibold text-gray-900">{content.engagement.sharing_rate}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Сохранение</div>
              <div className="text-lg font-semibold text-gray-900">{content.engagement.save_rate}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Комментарии/пост</div>
              <div className="text-lg font-semibold text-gray-900">{content.engagement.comments_per_post}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTeamDashboard;

