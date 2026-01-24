import React from 'react';
import { FaMapMarkedAlt, FaHeart, FaComment, FaShare, FaEye, FaEdit, FaTrash, FaRoute, FaClock } from 'react-icons/fa';
import { ContentCardData } from './ContentCard';
import StarRating from '../../Common/StarRating';

interface RouteCardProps {
  route: ContentCardData;
  onEdit?: (route: ContentCardData) => void;
  onDelete?: (route: ContentCardData) => void;
  onRead?: (route: ContentCardData) => void;
  onShare?: (route: ContentCardData) => void;
  onRatingChange?: (route: ContentCardData, rating: number) => void;
  compact?: boolean;
  isOwnProfile?: boolean;
}

const RouteCard: React.FC<RouteCardProps> = ({ 
  route, 
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

  // Моковые данные для демонстрации
  const routeStats = {
    distance: '450 км',
    duration: '6 часов',
    points: 12
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 ${
      compact ? 'p-3' : 'p-4'
    }`}>
      <div className="flex items-start space-x-4">
        {/* Иконка маршрута */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
          <FaMapMarkedAlt className="w-5 h-5" />
        </div>
        
        {/* Основной контент */}
        <div className="flex-1 min-w-0">
          {/* Заголовок и рейтинг */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                  Маршрут
                </span>
                {route.metadata.category && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 capitalize">
                      {route.metadata.category}
                    </span>
                  </>
                )}
              </div>
              <h4 className="font-semibold text-gray-800 truncate">{route.title}</h4>
            </div>
            <div className="ml-2 flex-shrink-0">
              <StarRating
                rating={route.rating || 0}
                isInteractive={!isOwnProfile && !!onRatingChange}
                onRatingChange={(rating) => onRatingChange?.(route, rating)}
                showNumber={true}
                size="sm"
              />
            </div>
          </div>
          
          {/* Превью маршрута */}
          <p className={`text-gray-600 mb-3 ${compact ? 'text-sm line-clamp-1' : 'text-sm line-clamp-2'}`}>
            {route.preview}
          </p>
          
          {/* Мини-карта маршрута */}
          <div className="mb-3">
            <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-200"></div>
              <div className="relative text-center text-gray-600">
                <FaRoute className="w-4 h-4 mx-auto mb-1" />
                <div className="text-xs font-medium">Трек маршрута</div>
                <div className="text-xs opacity-75">{routeStats.distance}</div>
              </div>
            </div>
          </div>
          
          {/* Статистика маршрута */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center bg-purple-50 rounded-lg py-2">
              <div className="text-xs text-purple-600 font-medium">Расстояние</div>
              <div className="text-sm font-semibold text-purple-800">{routeStats.distance}</div>
            </div>
            <div className="text-center bg-purple-50 rounded-lg py-2">
              <div className="text-xs text-purple-600 font-medium">Время</div>
              <div className="text-sm font-semibold text-purple-800">{routeStats.duration}</div>
            </div>
            <div className="text-center bg-purple-50 rounded-lg py-2">
              <div className="text-xs text-purple-600 font-medium">Точек</div>
              <div className="text-sm font-semibold text-purple-800">{routeStats.points}</div>
            </div>
          </div>
          
          {/* Статистика взаимодействий */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <FaEye className="w-4 h-4" />
              <span>{route.stats.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaHeart className="w-4 h-4" />
              <span>{route.stats.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaComment className="w-4 h-4" />
              <span>{route.stats.comments}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaShare className="w-4 h-4" />
              <span>{route.stats.shares}</span>
            </div>
          </div>
          
          {/* Теги */}
          {route.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {route.metadata.tags.slice(0, compact ? 2 : 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {route.metadata.tags.length > (compact ? 2 : 3) && (
                <span className="text-gray-400 text-xs px-2 py-1">
                  +{route.metadata.tags.length - (compact ? 2 : 3)}
                </span>
              )}
            </div>
          )}
          
          {/* Действия */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {formatDate(route.metadata.createdAt)}
            </div>
            
            <div className="flex items-center space-x-2">
              {route.interactive.canRead && onRead && (
                <button
                  onClick={() => onRead(route)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
                >
                  Открыть
                </button>
              )}
              
              {route.interactive.canEdit && onEdit && (
                <button
                  onClick={() => onEdit(route)}
                  className="text-gray-600 hover:text-gray-700 p-1 rounded transition-colors"
                  title="Редактировать"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
              )}
              
              {route.interactive.canShare && onShare && (
                <button
                  onClick={() => onShare(route)}
                  className="text-green-600 hover:text-green-700 p-1 rounded transition-colors"
                  title="Поделиться"
                >
                  <FaShare className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(route)}
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

export default RouteCard;
