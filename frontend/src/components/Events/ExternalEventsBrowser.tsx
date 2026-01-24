import React, { useState, useEffect } from 'react';
import { externalEventsService, ExternalEvent, EventSearchParams } from '../../services/externalEventsService';
import { FaSearch, FaMapMarkerAlt, FaCalendar, FaUsers, FaExternalLinkAlt, FaDownload } from 'react-icons/fa';

interface ExternalEventsBrowserProps {
  onEventSelect?: (event: ExternalEvent) => void;
  onSaveEvent?: (event: ExternalEvent) => void;
}

export const ExternalEventsBrowser: React.FC<ExternalEventsBrowserProps> = ({
  onEventSelect,
  onSaveEvent
}) => {
  const [events, setEvents] = useState<ExternalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<EventSearchParams>({
    location: 'Москва',
    radius: 25,
    limit: 20
  });
  const [categories, setCategories] = useState<{ id: string; name: string; icon?: string }[]>([]);

  useEffect(() => {
    loadCategories();
    searchEvents();
  }, []);

  const loadCategories = async () => {
    const cats = await externalEventsService.getEventCategories();
    setCategories(cats);
  };

  const searchEvents = async () => {
    setLoading(true);
    try {
      const results = await externalEventsService.searchEvents(searchParams);
      setEvents(results);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchEvents();
  };

  const handleSaveEvent = async (event: ExternalEvent) => {
    try {
      const success = await externalEventsService.saveEventToLocal(event);
      if (success) {
        onSaveEvent?.(event);
        // Показать уведомление об успехе
      }
    } catch (error) {
      }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'yandex': return '🔍';
      case 'timepad': return '🎫';
      case 'vk': return '📘';
      case 'dgis': return '🗺️';
      case 'afisha': return '📰';
      default: return '📅';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full">
      {/* Поисковая форма */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Поиск событий</h3>
        
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <FaMapMarkerAlt className="inline mr-2 text-slate-500" />
                Местоположение
              </label>
              <input
                type="text"
                value={searchParams.location || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Введите город или адрес"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <FaCalendar className="inline mr-2 text-slate-500" />
                Категория
              </label>
              <select
                value={searchParams.category || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Все категории</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchParams.query || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Поиск по названию события..."
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
            >
              <FaSearch className="inline mr-1" />
              {loading ? '...' : 'Найти'}
            </button>
          </div>
        </form>
      </div>

      {/* Результаты поиска */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600 text-sm">Поиск событий...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                {event.image_url && (
                  <div className="h-32 bg-slate-100">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                      {event.title}
                    </h3>
                    <span className="text-lg ml-2" title={`Источник: ${event.source}`}>
                      {getSourceIcon(event.source)}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center">
                      <FaCalendar className="mr-1 text-blue-500" />
                      {formatDate(event.start_date)}
                    </div>
                    
                    {event.location?.address && (
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-1 text-red-500" />
                        <span className="line-clamp-1">{event.location.address}</span>
                      </div>
                    )}

                    {event.attendees_count && (
                      <div className="flex items-center">
                        <FaUsers className="mr-1 text-green-500" />
                        {event.attendees_count} участников
                      </div>
                    )}

                    {event.price && (
                      <div className="text-green-600 font-medium text-xs">
                        {event.price}
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => onEventSelect?.(event)}
                      className="flex-1 px-2 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Выбрать
                    </button>
                    
                    <button
                      onClick={() => handleSaveEvent(event)}
                      className="px-2 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      title="Сохранить в локальную базу"
                    >
                      <FaDownload />
                    </button>
                    
                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1.5 bg-slate-600 text-white text-xs rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        title="Открыть на сайте источника"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">📅</div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">События не найдены</h3>
            <p className="text-slate-600 text-xs">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
};
