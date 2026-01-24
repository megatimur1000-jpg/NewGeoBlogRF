import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

type ContentType = 'events' | 'posts' | 'routes' | 'markers' | 'blogs' | 'comments' | 'chats';
type StatusFilter = 'all' | 'pending' | 'active' | 'rejected' | 'hidden';

interface HistoryItem {
  id: string;
  title?: string;
  description?: string;
  body?: string;
  content?: string;
  author_id?: string;
  author_name?: string;
  author_email?: string;
  created_at: string;
  updated_at: string;
  status: string;
  photo_urls?: string;
  ai_decision_id?: string;
  ai_suggestion?: 'approve' | 'reject' | 'hide' | 'review';
  ai_confidence?: number;
  ai_reason?: string;
  ai_category?: string;
  ai_issues?: string[];
  admin_verdict?: 'correct' | 'incorrect' | 'pending' | null;
  admin_feedback?: string;
  reviewed_at?: string;
  ai_analyzed_at?: string;
  [key: string]: any;
}

const ModerationHistoryPanel: React.FC = () => {
  const [contentType, setContentType] = useState<ContentType>('posts');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadHistory();
  }, [contentType, statusFilter, searchQuery, page]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Требуется авторизация');
        return;
      }

      const params: any = {
        limit,
        offset: (page - 1) * limit,
        sort: 'created_at DESC'
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await apiClient.get(`/moderation/history/${contentType}`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setHistory(response.data.data || []);
        setTotal(response.data.total || 0);
      } else {
        setHistory([]);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки истории:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка загрузки истории');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (itemId: string, action: 'approve' | 'reject' | 'revision') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Требуется авторизация');
        return;
      }

      const item = history.find(h => h.id === itemId);
      if (!item) return;

      let endpoint = '';
      if (action === 'approve') {
        endpoint = `/moderation/${contentType}/${itemId}/approve`;
      } else if (action === 'reject') {
        endpoint = `/moderation/${contentType}/${itemId}/reject`;
      } else if (action === 'revision') {
        endpoint = `/moderation/${contentType}/${itemId}/revision`;
      }

      await apiClient.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(action === 'approve' ? 'Контент одобрен и опубликован!' : action === 'reject' ? 'Контент отклонён' : 'Контент отправлен на доработку');
      
      // Удаляем из списка истории (если это pending элемент)
      if (action === 'approve' || action === 'reject') {
        setHistory(prev => prev.filter(h => h.id !== itemId));
        setTotal(prev => Math.max(0, prev - 1));
      }
      
      // Перезагружаем историю для обновления статусов
      loadHistory();
    } catch (err: any) {
      console.error('Ошибка модерации:', err);
      alert(err.response?.data?.message || 'Ошибка модерации');
    }
  };

  const loadDetails = async (item: HistoryItem) => {
    try {
      setSelectedItem(item);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await apiClient.get(`/moderation/${contentType}/${item.id}/details`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setDetails(response.data);
    } catch (err: any) {
      console.error('Ошибка загрузки деталей:', err);
      alert('Ошибка загрузки деталей контента');
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending': return 'На модерации';
      case 'active': return 'Одобрено';
      case 'rejected': return 'Отклонено';
      case 'hidden': return 'Скрыто';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'hidden': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuggestionLabel = (suggestion?: string): string => {
    switch (suggestion) {
      case 'approve': return 'Одобрить';
      case 'reject': return 'Отклонить';
      case 'hide': return 'Скрыть';
      case 'review': return 'На проверку';
      default: return 'Нет рекомендации';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const contentTypeLabels: Record<ContentType, string> = {
    events: 'События',
    posts: 'Посты',
    routes: 'Маршруты',
    markers: 'Метки',
    blogs: 'Блоги',
    comments: 'Комментарии',
    chats: 'Чаты'
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">История модерации</h2>
        <p className="text-gray-600">Просмотр всех постов с любым статусом, включая рекомендации ИИ</p>
      </div>

      {/* Фильтры */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип контента:
            </label>
            <select
              value={contentType}
              onChange={(e) => {
                setContentType(e.target.value as ContentType);
                setPage(1);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(contentTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(1);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Все</option>
              <option value="pending">На модерации</option>
              <option value="active">Одобрено</option>
              <option value="rejected">Отклонено</option>
              <option value="hidden">Скрыто</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Поиск:
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Поиск по тексту..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Список истории */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-800 font-semibold mb-2">Ошибка</div>
          <div className="text-red-600">{error}</div>
          <button
            onClick={loadHistory}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Попробовать снова
          </button>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-xl font-semibold text-gray-800 mb-2">История пуста</div>
          <div className="text-gray-600">
            Нет контента с выбранными фильтрами.
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Найдено: {total} {total === 1 ? 'запись' : total < 5 ? 'записи' : 'записей'}
          </div>

          <div className="space-y-4 mb-6 max-h-[600px] overflow-y-auto pr-2">
            {history.map((item) => {
              const title = item.title || item.description || item.body || item.content || 'Без названия';
              const text = item.description || item.body || item.content || '';
              
              return (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1 mb-3">
                        <div>Автор: {item.author_name || item.author_id || 'Гость'}</div>
                        <div>Создано: {formatDate(item.created_at)}</div>
                        {item.ai_analyzed_at && (
                          <div>ИИ проанализировал: {formatDate(item.ai_analyzed_at)}</div>
                        )}
                        {item.reviewed_at && (
                          <div>Проверено: {formatDate(item.reviewed_at)}</div>
                        )}
                      </div>

                      {/* Рекомендации ИИ */}
                      {item.ai_suggestion && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                          <div className="text-sm font-semibold text-blue-900 mb-1">
                            Рекомендация ИИ:
                          </div>
                          <div className="text-sm text-blue-800 space-y-1">
                            <div>
                              <span className="font-medium">Предложение:</span> {getSuggestionLabel(item.ai_suggestion)}
                            </div>
                            {item.ai_confidence && (
                              <div>
                                <span className="font-medium">Уверенность:</span> {Math.round(item.ai_confidence * 100)}%
                              </div>
                            )}
                            {item.ai_category && (
                              <div>
                                <span className="font-medium">Категория:</span> {item.ai_category}
                              </div>
                            )}
                            {item.ai_reason && (
                              <div className="mt-2 text-xs text-blue-700">
                                {item.ai_reason}
                              </div>
                            )}
                            {item.admin_verdict && (
                              <div className="mt-2">
                                <span className="font-medium">Вердикт админа:</span>{' '}
                                {item.admin_verdict === 'correct' ? '✅ Правильно' : '❌ Неправильно'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {text && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-md">
                          <div className="text-sm text-gray-700 line-clamp-3">
                            {text}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <button
                      onClick={() => loadDetails(item)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Подробнее
                    </button>
                    
                    {/* Статус для уже промодерированных постов - по центру */}
                    {item.status !== 'pending' && (
                      <div className="flex-1 text-center">
                        <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${getStatusColor(item.status)}`}>
                          {item.status === 'active' ? '✅ Опубликовано' :
                           item.status === 'rejected' ? '❌ Отклонено' :
                           item.status === 'revision' ? '⚠️ На доработке' :
                           getStatusLabel(item.status)}
                        </span>
                      </div>
                    )}
                    
                    {/* Кнопки управления ТОЛЬКО для элементов на модерации */}
                    {item.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={async () => {
                            await handleModerate(item.id, 'approve');
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        >
                          Одобрить
                        </button>
                        <button
                          onClick={async () => {
                            await handleModerate(item.id, 'revision');
                          }}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                        >
                          На доработку
                        </button>
                        <button
                          onClick={async () => {
                            await handleModerate(item.id, 'reject');
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                          Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назад
              </button>
              <span className="text-sm text-gray-600">
                Страница {page} из {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперёд
              </button>
            </div>
          )}
        </>
      )}

      {/* Модальное окно с деталями */}
      {selectedItem && details && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {details.content?.title || details.content?.description || 'Детали контента'}
                </h3>
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Полная информация о контенте */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-md">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Информация о контенте:</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>ID: {details.content?.id}</div>
                    <div>Статус: <span className={getStatusColor(details.content?.status)}>{getStatusLabel(details.content?.status)}</span></div>
                    <div>Автор: {details.content?.author_name || details.content?.author_id || 'Гость'}</div>
                    <div>Создано: {formatDate(details.content?.created_at)}</div>
                    <div>Обновлено: {formatDate(details.content?.updated_at)}</div>
                  </div>
                </div>

                {/* Полный текст контента */}
                {(details.content?.body || details.content?.description || details.content?.content) && (
                  <div className="p-4 bg-white border border-gray-200 rounded-md">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Текст контента:</div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {details.content?.body || details.content?.description || details.content?.content}
                    </div>
                  </div>
                )}

                {/* Рекомендации ИИ */}
                {details.aiDecision && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="text-sm font-semibold text-blue-900 mb-2">Рекомендации ИИ-помощника:</div>
                    <div className="text-sm text-blue-800 space-y-2">
                      <div>
                        <span className="font-medium">Предложение:</span> {getSuggestionLabel(details.aiDecision.ai_suggestion)}
                      </div>
                      {details.aiDecision.ai_confidence && (
                        <div>
                          <span className="font-medium">Уверенность:</span> {Math.round(details.aiDecision.ai_confidence * 100)}%
                        </div>
                      )}
                      {details.aiDecision.ai_category && (
                        <div>
                          <span className="font-medium">Категория:</span> {details.aiDecision.ai_category}
                        </div>
                      )}
                      {details.aiDecision.ai_reason && (
                        <div className="mt-2 p-2 bg-blue-100 rounded">
                          <div className="font-medium mb-1">Развёрнутая рекомендация:</div>
                          <div className="text-xs">{details.aiDecision.ai_reason}</div>
                        </div>
                      )}
                      {details.aiDecision.ai_issues && details.aiDecision.ai_issues.length > 0 && (
                        <div className="mt-2">
                          <div className="font-medium mb-1">Обнаруженные проблемы:</div>
                          <ul className="list-disc list-inside text-xs space-y-1">
                            {details.aiDecision.ai_issues.map((issue: string, idx: number) => (
                              <li key={idx}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {details.aiDecision.admin_verdict && (
                        <div className="mt-2">
                          <span className="font-medium">Вердикт админа:</span>{' '}
                          {details.aiDecision.admin_verdict === 'correct' ? '✅ Правильно' : '❌ Неправильно'}
                        </div>
                      )}
                      {details.aiDecision.admin_feedback && (
                        <div className="mt-2">
                          <span className="font-medium">Комментарий админа:</span>{' '}
                          <div className="text-xs mt-1">{details.aiDecision.admin_feedback}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* История модерации */}
                {details.moderationHistory && details.moderationHistory.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="text-sm font-semibold text-yellow-900 mb-2">История модерации:</div>
                    <div className="text-sm text-yellow-800 space-y-2">
                      {details.moderationHistory.map((historyItem: any, idx: number) => (
                        <div key={idx} className="p-2 bg-yellow-100 rounded">
                          <div>Действие: {historyItem.action}</div>
                          {historyItem.reason && <div>Причина: {historyItem.reason}</div>}
                          {historyItem.moderated_at && <div>Дата: {formatDate(historyItem.moderated_at)}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationHistoryPanel;

