import React, { useState, useEffect } from 'react';
import { getPendingEvents, approveEvent, rejectEvent } from '../../services/eventService';
import { EventData, EventLocation } from '../../types/event';
import apiClient from '../../api/apiClient';

interface EventsModerationPanelProps {
  className?: string;
}

const EventsModerationPanel: React.FC<EventsModerationPanelProps> = ({ className }) => {
  const [pendingEvents, setPendingEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPendingEvents();
  }, []);

  const loadPendingEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const events = await getPendingEvents();
      setPendingEvents(events);
    } catch (err: any) {
      console.error('Ошибка загрузки событий на модерации:', err);
      setError(err.message || 'Ошибка загрузки событий');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId: string) => {
    try {
      setProcessing(eventId);
      await approveEvent(eventId);
      // Удаляем событие из списка
      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err: any) {
      console.error('Ошибка одобрения события:', err);
      alert(err.message || 'Ошибка одобрения события');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (eventId: string, reason?: string) => {
    const rejectReason = reason || prompt('Укажите причину отклонения:') || 'Не указана';
    if (!rejectReason) return;

    try {
      setProcessing(eventId);
      await rejectEvent(eventId, rejectReason);
      // Удаляем событие из списка
      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err: any) {
      console.error('Ошибка отклонения события:', err);
      alert(err.message || 'Ошибка отклонения события');
    } finally {
      setProcessing(null);
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

  const getMainPhoto = (event: EventData) => {
    const eventAny = event as any; // Используем any для доступа к динамическим полям
    if (eventAny.cover_image_url) return eventAny.cover_image_url;
    if (event.image_url) return event.image_url;
    if (eventAny.photo_urls && Array.isArray(eventAny.photo_urls) && eventAny.photo_urls.length > 0) {
      return eventAny.photo_urls[0];
    }
    if (typeof eventAny.photo_urls === 'string' && eventAny.photo_urls) {
      try {
        const parsed = JSON.parse(eventAny.photo_urls);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch {
        // Если не JSON, пробуем как CSV
        const urls = eventAny.photo_urls.split(',').map((s: string) => s.trim()).filter(Boolean);
        if (urls.length > 0) return urls[0];
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-12 ${className || ''}`}>
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">Загрузка событий на модерации...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className || ''}`}>
        <div className="flex items-center">
          <i className="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
          <div>
            <h3 className="text-red-800 font-semibold">Ошибка загрузки</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={loadPendingEvents}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className={className || ''}>
      {/* Заголовок */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Модерация событий
        </h2>
        <p className="text-gray-600">
          События, ожидающие проверки: {pendingEvents.length}
        </p>
      </div>

      {/* Список событий */}
      {pendingEvents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-check-circle text-4xl text-green-500 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Очередь пуста!
          </h3>
          <p className="text-gray-600">
            Все события прошли модерацию.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingEvents.map(event => {
            const mainPhoto = getMainPhoto(event);
            const isProcessingEvent = processing === event.id;

            return (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="md:flex">
                  {/* Фото */}
                  {mainPhoto && (
                    <div className="md:w-1/3 h-48 md:h-auto bg-gray-200">
                      <img
                        src={mainPhoto}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Контент */}
                  <div className={`p-6 ${mainPhoto ? 'md:w-2/3' : 'w-full'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-2">
                          {event.category && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {event.category}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center">
                              <i className="fas fa-map-marker-alt mr-1"></i>
                              {typeof event.location === 'string' 
                                ? event.location 
                                : (event.location as EventLocation)?.address || (event.location as EventLocation)?.coordinates ? 'Координаты указаны' : 'Не указано'}
                            </span>
                          )}
                        </div>
                        {(event.start_datetime || event.start_date) && (
                          <p className="text-sm text-gray-600 mb-2">
                            <i className="fas fa-calendar-alt mr-2"></i>
                            {formatDate(event.start_datetime || event.start_date)}
                          </p>
                        )}
                        {event.creator_name && (
                          <p className="text-sm text-gray-500">
                            <i className="fas fa-user mr-2"></i>
                            Создатель: {event.creator_name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Описание */}
                    {event.description && (
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed line-clamp-3">
                          {event.description}
                        </p>
                      </div>
                    )}

                    {/* Дополнительные фото */}
                    {(() => {
                      const eventAny = event as any;
                      const photoUrls = eventAny.photo_urls;
                      if (!photoUrls) return null;
                      
                      let photoCount = 0;
                      if (Array.isArray(photoUrls)) {
                        photoCount = photoUrls.length;
                      } else if (typeof photoUrls === 'string') {
                        try {
                          const parsed = JSON.parse(photoUrls);
                          photoCount = Array.isArray(parsed) ? parsed.length : 1;
                        } catch {
                          // Если не JSON, пробуем как CSV
                          const urls = photoUrls.split(',').map((s: string) => s.trim()).filter(Boolean);
                          photoCount = urls.length;
                        }
                      }
                      
                      if (photoCount === 0) return null;
                      
                      return (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">
                            Дополнительные фото: {photoCount}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Действия */}
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <button
                        onClick={() => handleReject(event.id)}
                        disabled={isProcessingEvent}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center space-x-2"
                      >
                        {isProcessingEvent ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Обработка...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-times mr-2"></i>
                            <span>Отклонить</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleApprove(event.id)}
                        disabled={isProcessingEvent}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center space-x-2"
                      >
                        {isProcessingEvent ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Обработка...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check mr-2"></i>
                            <span>Одобрить</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsModerationPanel;

