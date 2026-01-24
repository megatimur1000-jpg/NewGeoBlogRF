import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';

type ContentType = 'posts' | 'markers' | 'events' | 'comments' | 'complaints' | 'suggestions';
type StatusType = 'pending' | 'approved' | 'revision' | 'rejected';

interface AIDecision {
  id: string;
  content_type: string;
  content_id: string;
  ai_suggestion: 'approve' | 'reject' | 'hide' | 'review';
  ai_confidence: number;
  admin_verdict: 'correct' | 'incorrect' | 'pending' | null;
  content_data: any;
  created_at: string;
}

interface ModerationCounts {
  [key: string]: {
    pending: number;
    approved: number;
    revision: number;
    rejected: number;
  };
}

const AIModerationPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeContentType, setActiveContentType] = useState<ContentType>('posts');
  const [activeStatus, setActiveStatus] = useState<StatusType>('pending');
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [counts, setCounts] = useState<ModerationCounts>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCounts();
  }, []);

  useEffect(() => {
    loadDecisions();
  }, [activeContentType, activeStatus]);

  const loadCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await apiClient.get('/moderation/ai/counts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setCounts(response.data);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки счётчиков:', err);
    }
  };

  const loadDecisions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await apiClient.get(`/moderation/ai/${activeContentType}/review?status=${activeStatus}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        const decisionsArray = Array.isArray(response.data) ? response.data : [];
        const validDecisions = decisionsArray.filter(d => {
          const hasContent = d.content_data && (d.content_data.id || d.content_data.title || d.content_data.body);
          return hasContent;
        });
        setDecisions(validDecisions);
      } else {
        setDecisions([]);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки:', err);
      setDecisions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: StatusType): string => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'approved': return 'bg-green-100 text-green-700 border-green-300';
      case 'revision': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusLabel = (status: StatusType): string => {
    switch (status) {
      case 'pending': return 'На модерации';
      case 'approved': return 'Одобрено';
      case 'revision': return 'На доработке';
      case 'rejected': return 'Отклонено';
      default: return status;
    }
  };

  const contentTypeLabels: Record<ContentType, string> = {
    posts: 'Посты',
    markers: 'Метки',
    events: 'События',
    comments: 'Комментарии',
    complaints: 'Жалобы',
    suggestions: 'Предложения'
  };

  const statusLabels: Record<StatusType, string> = {
    pending: 'На модерации',
    approved: 'Одобрено',
    revision: 'На доработке',
    rejected: 'Отклонено'
  };

  const getCount = (contentType: ContentType, status: StatusType): number => {
    return counts[contentType]?.[status] || 0;
  };

  const handleOpenPost = (decision: AIDecision) => {
    if (activeContentType === 'posts') {
      navigate(`/posts?post=${decision.content_id}`);
    }
  };

  const handleModerate = async (decisionId: string, action: 'approve' | 'reject' | 'revision') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Требуется авторизация');
        return;
      }

      const decision = decisions.find(d => d.id === decisionId);
      if (!decision) return;

      let endpoint = '';
      if (action === 'approve') {
        endpoint = `/moderation/${activeContentType}/${decision.content_id}/approve`;
      } else if (action === 'reject') {
        endpoint = `/moderation/${activeContentType}/${decision.content_id}/reject`;
      } else if (action === 'revision') {
        endpoint = `/moderation/${activeContentType}/${decision.content_id}/revision`;
      }

      await apiClient.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(action === 'approve' ? 'Контент одобрен' : action === 'reject' ? 'Контент отклонён' : 'Контент отправлен на доработку');
      
      // Перезагружаем данные
      loadDecisions();
      loadCounts();
    } catch (err: any) {
      console.error('Ошибка модерации:', err);
      alert(err.response?.data?.message || 'Ошибка модерации');
    }
  };

  return (
    <div className="w-full">
      {/* Вкладки типов контента */}
      <div className="mb-4 border-b border-gray-200">
        <div className="flex space-x-1 overflow-x-auto">
          {(Object.keys(contentTypeLabels) as ContentType[]).map((type) => {
            const pendingCount = getCount(type, 'pending');
            return (
              <button
                key={type}
                onClick={() => {
                  setActiveContentType(type);
                  setActiveStatus('pending');
                }}
                className={`px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeContentType === type
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {contentTypeLabels[type]}
                {pendingCount > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeContentType === type
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Подвкладки состояний */}
      <div className="mb-4 border-b border-gray-200">
        <div className="flex space-x-1">
          {(Object.keys(statusLabels) as StatusType[]).map((status) => {
            const count = getCount(activeContentType, status);
            return (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-3 py-1 border-b-2 font-medium text-sm ${
                  activeStatus === status
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {statusLabels[status]}
                {count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeStatus === status
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Список контента */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Загрузка...</div>
      ) : decisions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Нет контента в разделе "{statusLabels[activeStatus]}"
        </div>
      ) : (
        <div className="mb-4 text-sm text-gray-600">
          Найдено: {decisions.length} {decisions.length === 1 ? 'запись' : decisions.length < 5 ? 'записи' : 'записей'}
        </div>
      )}
      
      {!loading && decisions.length > 0 && (
        <div className="space-y-2">
          {decisions.map((decision) => {
            const content = decision.content_data || {};
            const title = content.title || content.description || content.body || content.content || 'Без названия';
            const currentStatus = activeStatus;

            return (
              <div
                key={decision.id}
                className={`p-4 rounded-lg border-2 hover:shadow-md transition-shadow ${getStatusColor(currentStatus)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div 
                      className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-blue-600"
                      onClick={() => handleOpenPost(decision)}
                    >
                      {title}
                    </div>
                    <div className="text-xs text-gray-600">
                      ID: {decision.content_id} • {new Date(decision.created_at).toLocaleString('ru-RU')}
                      {content.author_name && ` • Автор: ${content.author_name}`}
                    </div>
                  </div>
                  <div className={`ml-4 px-3 py-1 rounded text-sm font-medium border ${getStatusColor(currentStatus)}`}>
                    {getStatusLabel(currentStatus)}
                  </div>
                </div>
                
                {/* Кнопки управления (только для pending) */}
                {activeStatus === 'pending' && (
                  <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-300">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleModerate(decision.id, 'approve');
                      }}
                      className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                    >
                      Одобрить
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleModerate(decision.id, 'revision');
                      }}
                      className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-sm"
                    >
                      На доработку
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleModerate(decision.id, 'reject');
                      }}
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                    >
                      Отклонить
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIModerationPanel;
