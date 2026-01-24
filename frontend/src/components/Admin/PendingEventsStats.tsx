import React, { useState, useEffect } from 'react';
import { getPendingEvents } from '../../services/eventService';

const PendingEventsStats: React.FC = () => {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;
    
    const loadPendingCount = async () => {
      if (!isMounted) return;
      
      try {
        const events = await getPendingEvents();
        if (isMounted) {
          setPendingCount(Array.isArray(events) ? events.length : 0);
          setLoading(false);
        }
      } catch (error: any) {
        // Игнорируем ошибки авторизации/доступа - просто показываем 0
        if (isMounted) {
          setPendingCount(0);
          setLoading(false);
        }
        // Не логируем ошибки, чтобы не засорять консоль
      }
    };

    // Загружаем сразу
    loadPendingCount();
    
    // Обновляем каждые 30 секунд только если компонент еще смонтирован
    intervalId = setInterval(() => {
      if (isMounted) {
        loadPendingCount();
      }
    }, 30000);
    
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <div className="text-xs text-gray-500 mb-1">Ждут модерации</div>
          <div className="text-xl font-semibold text-gray-900">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <div className="text-xs text-gray-500 mb-1">Новые посты (сутки)</div>
          <div className="text-xl font-semibold text-gray-900">—</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <div className="text-xs text-gray-500 mb-1">VIP активных</div>
          <div className="text-xl font-semibold text-gray-900">—</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <div className="text-xs text-gray-500 mb-1">Рекламные посты</div>
          <div className="text-xl font-semibold text-gray-900">—</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className={`p-4 rounded-xl border ${pendingCount > 0 ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'}`}>
        <div className="text-xs text-gray-500 mb-1">Ждут модерации</div>
        <div className={`text-xl font-semibold ${pendingCount > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
          {pendingCount}
        </div>
      </div>
      <div className="p-4 rounded-xl border border-gray-200 bg-white">
        <div className="text-xs text-gray-500 mb-1">Новые посты (сутки)</div>
        <div className="text-xl font-semibold text-gray-900">—</div>
      </div>
      <div className="p-4 rounded-xl border border-gray-200 bg-white">
        <div className="text-xs text-gray-500 mb-1">VIP активных</div>
        <div className="text-xl font-semibold text-gray-900">—</div>
      </div>
      <div className="p-4 rounded-xl border border-gray-200 bg-white">
        <div className="text-xs text-gray-500 mb-1">Рекламные посты</div>
        <div className="text-xl font-semibold text-gray-900">—</div>
      </div>
    </div>
  );
};

export default PendingEventsStats;

