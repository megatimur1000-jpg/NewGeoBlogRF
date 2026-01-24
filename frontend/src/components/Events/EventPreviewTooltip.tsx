import React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { ExternalEvent } from '../../services/externalEventsService';

interface EventPreviewTooltipProps {
  events: ExternalEvent[];
  date: string;
  onEventClick?: (event: ExternalEvent) => void;
  onViewAll: () => void;
}

export const EventPreviewTooltip: React.FC<EventPreviewTooltipProps> = ({
  events,
  date,
  onEventClick,
  onViewAll
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'timepad': return '🎫';
      case 'vk': return '📘';
      case 'dgis': return '🗺️';
      default: return '📅';
    }
  };

  return (
    <div className="absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[320px] max-w-[400px] transform -translate-x-1/2 -translate-y-full mt-[-8px]">
      {/* Стрелка вниз */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
      
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-blue-500 mr-2" />
          <span className="font-semibold text-gray-800">{date}</span>
        </div>
        <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded-full">
          {events.length} событий
        </span>
      </div>

      {/* Список событий (максимум 3) */}
      <div className="space-y-2 mb-3">
        {events.slice(0, 3).map((event) => (
          <div
            key={event.id}
            onClick={() => onEventClick?.(event)}
            className="p-2 rounded-lg bg-gray-50 hover:bg-blue-50 cursor-pointer transition-colors group"
          >
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                {event.title}
              </h4>
              <span className="text-lg ml-2" title={`Источник: ${event.source}`}>
                {getSourceIcon(event.source)}
              </span>
            </div>
            
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center">
                <Clock className="mr-1 text-blue-500 w-3 h-3" />
                {formatDate(event.start_date)}
              </div>
              
              {event.location?.address && (
                <div className="flex items-center">
                  <MapPin className="mr-1 text-red-500 w-3 h-3" />
                  <span className="line-clamp-1">{event.location.address}</span>
                </div>
              )}

              {event.attendees_count && (
                <div className="flex items-center">
                  <Users className="mr-1 text-green-500 w-3 h-3" />
                  {event.attendees_count} участников
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка "Посмотреть все" */}
      {events.length > 3 && (
        <button
          onClick={onViewAll}
          className="w-full py-2 px-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium"
        >
          Посмотреть все {events.length} событий
        </button>
      )}
    </div>
  );
};
