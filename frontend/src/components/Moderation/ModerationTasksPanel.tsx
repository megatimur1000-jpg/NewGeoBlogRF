/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
// TODO: temporary — relax lint rules in large files while we migrate types (follow-up task)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/apiClient';

export interface ModerationTask {
  id: string;
  type: 'new_marker' | 'new_event' | 'new_post' | 'complaint' | 'suggestion';
  title: string;
  content: any;
  coordinates: [number, number] | null;
  created_at: string;
}

interface ModerationTasksPanelProps {
  contentType: 'markers' | 'events' | 'posts' | 'routes';
  onTaskClick?: (task: ModerationTask) => void;
  onTaskResolved?: () => void;
  onTasksChange?: (tasks: ModerationTask[]) => void;
}

const ModerationTasksPanel: React.FC<ModerationTasksPanelProps> = ({
  contentType,
  onTaskClick,
  onTaskResolved,
  onTasksChange
}) => {
  const { user } = useAuth() || { user: null } as any;
  const isAdmin = user?.role === 'admin';
  const [tasks, setTasks] = useState<ModerationTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<ModerationTask | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadTasks();
    }
  }, [contentType, isAdmin]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Требуется авторизация');
        return;
      }

      const response = await apiClient.get(`/moderation/tasks/${contentType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.tasks) {
        setTasks(response.data.tasks);
        if (onTasksChange) {
          onTasksChange(response.data.tasks);
        }
      } else {
        setTasks([]);
        if (onTasksChange) {
          onTasksChange([]);
        }
      }
    } catch (err: any) {
      console.error('Ошибка загрузки задач модерации:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка загрузки задач');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task: ModerationTask) => {
    setSelectedTask(task);
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  const handleModerate = async (action: 'approve' | 'reject' | 'revision', task: ModerationTask) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Требуется авторизация');
        return;
      }

      let endpoint = '';
      const data: any = {};

      // Определяем endpoint в зависимости от типа задачи
      if (task.type === 'new_marker' || task.type === 'new_event' || task.type === 'new_post') {
        const contentId = task.content.id;
        const type = task.type.replace('new_', '') + 's'; // new_marker -> markers
        endpoint = `/moderation/${type}/${contentId}/${action}`;
        if (action === 'reject' || action === 'revision') {
          const reason = prompt(action === 'reject' ? 'Причина отклонения:' : 'Причина отправки на доработку:');
          if (reason === null) return;
          data.reason = reason;
        }
      } else if (task.type === 'complaint' || task.type === 'suggestion') {
        // Для жалоб и предложений используем специальные endpoints
        const contentId = task.content.id;
        endpoint = `/moderation/${task.type}s/${contentId}/${action}`;
        if (action === 'reject' || action === 'revision') {
          const reason = prompt(action === 'reject' ? 'Причина отклонения:' : 'Причина отправки на доработку:');
          if (reason === null) return;
          data.reason = reason;
        }
      }

      await apiClient.post(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Задача успешно ${action === 'approve' ? 'одобрена' : action === 'reject' ? 'отклонена' : 'отправлена на доработку'}.`);
      
      // Перезагружаем задачи
      loadTasks();
      setSelectedTask(null);
      
      if (onTaskResolved) {
        onTaskResolved();
      }
    } catch (err: any) {
      console.error('Ошибка модерации:', err);
      alert(err.response?.data?.message || 'Ошибка модерации');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
      {/* Заголовок */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Задачи модерации</h2>
          <button
            onClick={loadTasks}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Обновить'}
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {tasks.length} {tasks.length === 1 ? 'задача' : tasks.length < 5 ? 'задачи' : 'задач'}
        </div>
      </div>

      {/* Список задач */}
      <div className="flex-1 overflow-y-auto">
        {error ? (
          <div className="p-4 text-red-600 text-sm">{error}</div>
        ) : loading ? (
          <div className="p-4 text-center text-gray-500">Загрузка...</div>
        ) : tasks.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Нет задач для модерации
          </div>
        ) : (
          <div className="divide-y">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedTask?.id === task.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => handleTaskClick(task)}
              >
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {task.title}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(task.created_at).toLocaleString('ru-RU')}
                </div>
                {task.coordinates && (
                  <div className="text-xs text-gray-400 mt-1">
                    📍 Координаты: {task.coordinates[0].toFixed(4)}, {task.coordinates[1].toFixed(4)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Детали выбранной задачи */}
      {selectedTask && (
        <div className="border-t bg-gray-50 p-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Детали задачи</h3>
            <div className="text-xs text-gray-600 space-y-1">
              {selectedTask.content.title && (
                <div><strong>Название:</strong> {selectedTask.content.title}</div>
              )}
              {selectedTask.content.description && (
                <div><strong>Описание:</strong> {selectedTask.content.description}</div>
              )}
              {selectedTask.content.reason && (
                <div><strong>Причина:</strong> {selectedTask.content.reason}</div>
              )}
              {selectedTask.content.suggestion_type && (
                <div><strong>Тип предложения:</strong> {selectedTask.content.suggestion_type}</div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleModerate('approve', selectedTask)}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Одобрить
            </button>
            <button
              onClick={() => handleModerate('revision', selectedTask)}
              className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
            >
              На доработку
            </button>
            <button
              onClick={() => handleModerate('reject', selectedTask)}
              className="flex-1 px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Отклонить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationTasksPanel;

