import React from 'react';
import StarRating from '../ui/StarRating';
import { useRating } from '../../hooks/useRating';
import { X, Calendar, MapPin, Users, Clock, Star, MessageCircle, Map, ExternalLink } from 'lucide-react';
import { ExternalEvent } from '../../services/externalEventsService';
import { useFavorites } from '../../contexts/FavoritesContext';
import ReportButton from '../Moderation/ReportButton';
import AddToFavoritesModal from '../Modals/AddToFavoritesModal';
import { useAddToFavorites } from '../../hooks/useAddToFavorites';

interface EventsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: ExternalEvent[];
  date: string;
  onEventClick: (event: ExternalEvent) => void;
}

export const EventsListModal: React.FC<EventsListModalProps> = ({
  isOpen,
  onClose,
  events,
  date,
  onEventClick
}) => {
  const { isModalOpen, currentItem, openModal, closeModal, handleConfirm } = useAddToFavorites();

  if (!isOpen) return null;

  const EventRating: React.FC<{ eventId: string | number }> = ({ eventId }) => {
    const { summary, handleRate } = useRating('event', eventId);
    return (
      <div className="mr-2">
        <StarRating value={summary.avg || 0} count={summary.count} interactive onChange={handleRate} />
      </div>
    );
  };

  const favorites = useFavorites();

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'culture': return '🎭';
      case 'sports': return '⚽';
      case 'business': return '💼';
      case 'technology': return '💻';
      case 'food': return '🍽️';
      case 'travel': return '✈️';
      default: return '📅';
    }
  };

  const toggleFavorite = (event: ExternalEvent) => {
    if (!favorites) return;
    const id = event.id.toString();
    if (favorites.isEventFavorite(id)) {
      favorites.removeFavoriteEvent(id);
    } else {
      // Открываем модал выбора категории вместо прямого добавления
      openModal({
        id,
        title: event.title,
        type: 'event',
        data: {
          date: new Date(event.start_date),
          location: event.location?.address || '',
          category: event.category || 'other'
        }
      });
    }
  };

  const isFavorite = (event: ExternalEvent) => {
    if (!favorites) return false;
    return favorites.isEventFavorite(event.id.toString());
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="w-6 h-6 mr-3" />
              <div>
                <h2 className="text-xl font-bold">События {date}</h2>
                <p className="text-blue-100 text-sm">{events.length} мероприятий найдено</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Содержимое */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer group"
                onClick={() => onEventClick(event)}
              >
                {/* Заголовок и источник */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center mt-1 space-x-3">
                      <span className="text-2xl" title={`Источник: ${event.source}`}>
                        {getSourceIcon(event.source)}
                      </span>
                      {event.category && (
                        <span className="text-lg" title="Категория">
                          {getCategoryIcon(event.category)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Действия */}
                  <div className="flex space-x-2 ml-4 items-center">
                    {event.id && (
                      <EventRating eventId={event.id} />
                    )}
                    <button
                      className={`p-2 bg-white/80 rounded-lg hover:bg-white transition-colors ${isFavorite(event) ? 'ring-2 ring-yellow-400' : ''}`}
                      title={isFavorite(event) ? 'В избранном' : 'В избранное'}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(event); }}
                    >
                      <Star className={`w-4 h-4 ${isFavorite(event) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`} />
                    </button>
                    <button className="p-2 bg-white/80 rounded-lg hover:bg-white transition-colors" title="Обсуждения" onClick={(e)=>e.stopPropagation()}>
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                    </button>
                    <ReportButton
                      contentId={event.id.toString()}
                      contentType="event"
                      contentTitle={event.title}
                      variant="icon"
                      size="sm"
                      className="p-2 bg-white/80 rounded-lg hover:bg-white transition-colors"
                    />
                    <button className="p-2 bg-white/80 rounded-lg hover:bg-white transition-colors" title="Построить маршрут" onClick={(e)=>e.stopPropagation()}>
                      <Map className="w-4 h-4 text-green-500" />
                    </button>
                  </div>
                </div>

                {/* Основная информация с фото */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Левая колонка: фото и информация под ним */}
                  <div className="space-y-3">
                    {/* Главное фото события */}
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-200">
                      {(() => {
                        const eventAny = event as any;
                        // Получаем главное фото (приоритет: cover_image_url > image_url > первое из photo_urls)
                        let mainPhoto: string | null = null;
                        if (eventAny.cover_image_url) {
                          mainPhoto = eventAny.cover_image_url;
                        } else if (event.image_url) {
                          mainPhoto = event.image_url;
                        } else if (eventAny.photo_urls) {
                          let allPhotos: string[] = [];
                          if (Array.isArray(eventAny.photo_urls)) {
                            allPhotos = eventAny.photo_urls.filter(Boolean);
                          } else if (typeof eventAny.photo_urls === 'string') {
                            allPhotos = eventAny.photo_urls.split(',').map((s: string) => s.trim()).filter(Boolean);
                          }
                          if (allPhotos.length > 0) {
                            mainPhoto = allPhotos[0];
                          }
                        }
                        
                        return mainPhoto ? (
                          <img 
                            src={mainPhoto} 
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            <div className="text-center">
                              <div className="text-2xl mb-2">📷</div>
                              <div>Фото сюда вставлять</div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    
                    {/* Дата и адрес под фото */}
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-sm">{formatDate(event.start_date)}</span>
                      </div>
                      
                      {event.location?.address && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-red-500" />
                          <span className="text-sm line-clamp-1">{event.location.address}</span>
                        </div>
                      )}

                      {event.attendees_count && (
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-green-500" />
                          <span className="text-sm">{event.attendees_count} участников</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Правая колонка: описание */}
                  <div className="space-y-2">
                    {event.description && (
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {event.description}
                      </p>
                    )}
                    
                    {event.price && (
                      <div className="text-sm">
                        <span className="text-gray-500">Стоимость: </span>
                        <span className="font-medium text-green-600">{event.price}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Дополнительные действия */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex space-x-2">
                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Подробнее
                      </a>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                  >
                    Открыть детали
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Модал выбора категории для добавления в избранное */}
      <AddToFavoritesModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        itemType={currentItem?.type}
        itemTitle={currentItem?.title}
      />
    </div>
  );
};