import React from 'react';
import { FaMapPin, FaHeart, FaComment, FaShare, FaEye, FaEdit, FaTrash, FaStar, FaCheckCircle } from 'react-icons/fa';
import { ContentCardData } from './ContentCard';
import StarRating from '../../Common/StarRating';

interface PlaceCardProps {
  place: ContentCardData;
  onEdit?: (place: ContentCardData) => void;
  onDelete?: (place: ContentCardData) => void;
  onRead?: (place: ContentCardData) => void;
  onShare?: (place: ContentCardData) => void;
  onRatingChange?: (place: ContentCardData, rating: number) => void;
  compact?: boolean;
  isOwnProfile?: boolean;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ 
  place, 
  onEdit, 
  onDelete, 
  onRead, 
  onShare,
  onRatingChange,
  compact = false,
  isOwnProfile = true
}) => {
  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('ru', { numeric: 'auto' }).format(
      Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  // Определяем тип места
  const isUserModified = place.metadata.tags.includes('#доработано') || place.metadata.tags.includes('#user_modified');
  const isFavorite = place.metadata.tags.includes('#избранное') || place.metadata.tags.includes('#favorite');

  return (
    <div className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 ${
      compact ? 'p-3' : 'p-4'
    } ${isFavorite ? 'ring-2 ring-orange-200' : ''}`}>
      <div className="flex items-start space-x-4">
        {/* Иконка места */}
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${
          isUserModified ? 'from-green-500 to-green-600' : 'from-orange-500 to-orange-600'
        } flex items-center justify-center text-white flex-shrink-0 relative`}>
          <FaMapPin className="w-5 h-5" />
          {isUserModified && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <FaCheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        {/* Основной контент */}
        <div className="flex-1 min-w-0">
          {/* Заголовок и рейтинг */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-xs font-medium uppercase tracking-wide ${
                  isUserModified ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {isUserModified ? 'Доработанное место' : 'Место'}
                </span>
                {place.metadata.category && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 capitalize">
                      {place.metadata.category}
                    </span>
                  </>
                )}
                {isFavorite && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-orange-600 font-medium">
                      ⭐ Избранное
                    </span>
                  </>
                )}
              </div>
              <h4 className="font-semibold text-gray-800 truncate">{place.title}</h4>
            </div>
            <div className="ml-2 flex-shrink-0">
              <StarRating
                rating={place.rating || 0}
                isInteractive={!isOwnProfile && !!onRatingChange}
                onRatingChange={(rating) => onRatingChange?.(place, rating)}
                showNumber={true}
                size="sm"
              />
            </div>
          </div>
          
          {/* Превью места */}
          <p className={`text-gray-600 mb-3 ${compact ? 'text-sm line-clamp-1' : 'text-sm line-clamp-2'}`}>
            {place.preview}
          </p>
          
          {/* Мини-карта места */}
          {place.mapData && (
            <div className="mb-3">
              <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className={`absolute inset-0 ${
                  isUserModified 
                    ? 'bg-gradient-to-br from-green-100 to-green-200' 
                    : 'bg-gradient-to-br from-orange-100 to-orange-200'
                }`}></div>
                <div className="relative text-center text-gray-600">
                  <FaMapPin className="w-4 h-4 mx-auto mb-1" />
                  <div className="text-xs font-medium">Местоположение</div>
                  <div className="text-xs opacity-75">
                    {place.mapData.lat.toFixed(2)}, {place.mapData.lng.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Статистика места */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className={`text-center rounded-lg py-2 ${
              isUserModified ? 'bg-green-50' : 'bg-orange-50'
            }`}>
              <div className={`text-xs font-medium ${
                isUserModified ? 'text-green-600' : 'text-orange-600'
              }`}>
                Тип
              </div>
              <div className={`text-sm font-semibold ${
                isUserModified ? 'text-green-800' : 'text-orange-800'
              }`}>
                {place.metadata.category}
              </div>
            </div>
            <div className={`text-center rounded-lg py-2 ${
              isUserModified ? 'bg-green-50' : 'bg-orange-50'
            }`}>
              <div className={`text-xs font-medium ${
                isUserModified ? 'text-green-600' : 'text-orange-600'
              }`}>
                Статус
              </div>
              <div className={`text-sm font-semibold ${
                isUserModified ? 'text-green-800' : 'text-orange-800'
              }`}>
                {isUserModified ? 'Доработано' : 'Обычное'}
              </div>
            </div>
          </div>
          
          {/* Статистика взаимодействий */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <FaEye className="w-4 h-4" />
              <span>{place.stats.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaHeart className="w-4 h-4" />
              <span>{place.stats.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaComment className="w-4 h-4" />
              <span>{place.stats.comments}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaShare className="w-4 h-4" />
              <span>{place.stats.shares}</span>
            </div>
          </div>
          
          {/* Теги */}
          {place.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {place.metadata.tags.slice(0, compact ? 2 : 3).map((tag, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded-full ${
                    tag.includes('#доработано') || tag.includes('#user_modified')
                      ? 'bg-green-100 text-green-700'
                      : tag.includes('#избранное') || tag.includes('#favorite')
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tag}
                </span>
              ))}
              {place.metadata.tags.length > (compact ? 2 : 3) && (
                <span className="text-gray-400 text-xs px-2 py-1">
                  +{place.metadata.tags.length - (compact ? 2 : 3)}
                </span>
              )}
            </div>
          )}
          
          {/* Действия */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {formatDate(place.metadata.createdAt)}
            </div>
            
            <div className="flex items-center space-x-2">
              {place.interactive.canRead && onRead && (
                <button
                  onClick={() => onRead(place)}
                  className={`text-sm font-medium transition-colors ${
                    isUserModified 
                      ? 'text-green-600 hover:text-green-700' 
                      : 'text-orange-600 hover:text-orange-700'
                  }`}
                >
                  Открыть
                </button>
              )}
              
              {place.interactive.canEdit && onEdit && (
                <button
                  onClick={() => onEdit(place)}
                  className="text-gray-600 hover:text-gray-700 p-1 rounded transition-colors"
                  title="Редактировать"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
              )}
              
              {place.interactive.canShare && onShare && (
                <button
                  onClick={() => onShare(place)}
                  className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                  title="Поделиться"
                >
                  <FaShare className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(place)}
                  className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                  title="Удалить"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
