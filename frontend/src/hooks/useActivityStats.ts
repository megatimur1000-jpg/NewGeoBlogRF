import { useState, useEffect } from 'react';
import { activityService, ActivityStats } from '../services/activityService';
import { useAuth } from '../contexts/AuthContext';

export const useActivityStats = () => {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const statsData = await activityService.getActivityStats();
      
      // Преобразуем данные в нужный формат
      const transformedStats = {
        ...statsData,
        total_activities: statsData.total_activities || 0,
        unread_activities: statsData.unread_activities || 0,
        message_activities: statsData.message_activities || 0,
        system_activities: statsData.system_activities || 0
      };
      
      setStats(transformedStats);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить статистику');
      
      // Устанавливаем тестовые данные при ошибке
      setStats({
        total_activities: 42,
        unread_activities: 7,
        message_activities: 15,
        system_activities: 3
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    loadStats();
    
    // Убираем автообновление - оно вызывает множественные перезагрузки
    // const interval = setInterval(loadStats, 30000);
    // return () => clearInterval(interval);
  }, [user]);

  return {
    stats,
    loading,
    error,
    refetch: loadStats
  };
};
