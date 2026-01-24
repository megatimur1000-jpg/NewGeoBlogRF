import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

interface ProjectStats {
  users: {
    total: number;
    admins: number;
    registered: number;
    new_last_week: number;
    new_last_month: number;
  };
  content: Array<{
    type: string;
    total: number;
    pending: number;
    active: number;
    rejected: number;
    new_last_week: number;
    new_last_month: number;
  }>;
  aiModeration: {
    total_decisions: number;
    pending_verdicts: number;
    correct_verdicts: number;
    incorrect_verdicts: number;
    ai_approved: number;
    ai_rejected: number;
    avg_confidence: number;
    new_last_week: number;
  };
  gamification: {
    users_with_xp: number;
    total_xp_awarded: number;
    avg_xp_per_user: number;
    high_level_users: number;
    mid_level_users: number;
  };
  topUsers: Array<{
    id: string;
    username: string;
    total_xp: number;
    current_level: number;
    rank: string;
    posts_count: number;
    events_count: number;
    routes_count: number;
  }>;
  dailyStats: Array<{
    date: string;
    new_content: number;
  }>;
}

const AdminStatsPanel: React.FC = () => {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Требуется авторизация');
        return;
      }

      const response = await apiClient.get('/admin/stats/project', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setStats(response.data);
    } catch (err: any) {
      console.error('Ошибка загрузки статистики:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  };

  const contentTypeLabels: Record<string, string> = {
    events: 'События',
    posts: 'Посты',
    routes: 'Маршруты',
    markers: 'Метки',
    blogs: 'Блоги'
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Загрузка статистики...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-red-800 font-semibold mb-2">Ошибка</div>
        <div className="text-red-600">{error}</div>
        <button
          onClick={loadStats}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!stats) {
    return <div>Нет данных</div>;
  }

  return (
    <div className="space-y-6">
      {/* Пользователи */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Пользователи</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Всего</div>
            <div className="text-2xl font-bold text-blue-600">{stats.users.total}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Админы</div>
            <div className="text-2xl font-bold text-purple-600">{stats.users.admins}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Зарегистрированных</div>
            <div className="text-2xl font-bold text-green-600">{stats.users.registered}</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">За неделю</div>
            <div className="text-2xl font-bold text-orange-600">{stats.users.new_last_week}</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">За месяц</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.users.new_last_month}</div>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Контент</h2>
        <div className="space-y-4">
          {stats.content.map((item) => (
            <div key={item.type} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{contentTypeLabels[item.type] || item.type}</h3>
                <div className="text-sm text-gray-500">Всего: {item.total}</div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-2">
                <div>
                  <div className="text-xs text-gray-500">На модерации</div>
                  <div className="text-lg font-semibold text-orange-600">{item.pending}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Одобрено</div>
                  <div className="text-lg font-semibold text-green-600">{item.active}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Отклонено</div>
                  <div className="text-lg font-semibold text-red-600">{item.rejected}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Новых за неделю</div>
                  <div className="text-lg font-semibold text-blue-600">{item.new_last_week}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ИИ-модерация */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">ИИ-модерация</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Всего решений</div>
            <div className="text-2xl font-bold text-blue-600">{stats.aiModeration.total_decisions}</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Ждут вердикта</div>
            <div className="text-2xl font-bold text-orange-600">{stats.aiModeration.pending_verdicts}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Правильных</div>
            <div className="text-2xl font-bold text-green-600">{stats.aiModeration.correct_verdicts}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Уверенность ИИ</div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((stats.aiModeration.avg_confidence || 0) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Геймификация */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Геймификация</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Пользователей с XP</div>
            <div className="text-2xl font-bold text-blue-600">{stats.gamification.users_with_xp}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Всего XP начислено</div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(stats.gamification.total_xp_awarded || 0).toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Средний XP</div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(stats.gamification.avg_xp_per_user || 0)}
            </div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Высокий уровень (10+)</div>
            <div className="text-2xl font-bold text-orange-600">{stats.gamification.high_level_users}</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Средний уровень (5+)</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.gamification.mid_level_users}</div>
          </div>
        </div>
      </div>

      {/* Топ пользователей */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Топ активных пользователей</h2>
        <div className="space-y-2">
          {stats.topUsers.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{user.username}</div>
                  <div className="text-sm text-gray-500">Уровень {user.current_level} • {user.rank}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-blue-600">{Math.round(user.total_xp || 0).toLocaleString()} XP</div>
                <div className="text-xs text-gray-500">
                  {user.posts_count} постов • {user.events_count} событий • {user.routes_count} маршрутов
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStatsPanel;

