import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

interface Trends {
  trends: Array<{
    metric: string;
    current_period: number;
    previous_period: number;
    change: number;
    direction: 'up' | 'down' | 'stable';
  }>;
}

const AdminAnalyticsPanel: React.FC = () => {
  const [trends, setTrends] = useState<Trends | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await apiClient.get('/admin/stats/trends', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTrends(response.data);
    } catch (err: any) {
      console.error('Ошибка загрузки тенденций:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Загрузка аналитики...</div>
      </div>
    );
  }

  const metricLabels: Record<string, string> = {
    users: 'Пользователи',
    content: 'Контент'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Тенденции (последние 7 дней)</h2>
        {trends && trends.trends.length > 0 ? (
          <div className="space-y-4">
            {trends.trends.map((trend) => (
              <div key={trend.metric} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{metricLabels[trend.metric] || trend.metric}</div>
                    <div className="text-sm text-gray-500">
                      Текущий период: {trend.current_period} • Предыдущий: {trend.previous_period}
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${
                    trend.direction === 'up' ? 'text-green-600' :
                    trend.direction === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {Math.abs(trend.change)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">Нет данных о тенденциях</div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsPanel;

