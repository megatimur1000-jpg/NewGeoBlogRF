import React from 'react';
import { FaBlog, FaHeart, FaComment, FaShare, FaEye, FaEdit, FaTrash, FaMapPin } from 'react-icons/fa';
import { ContentCardData } from './ContentCard';
import StarRating from '../../Common/StarRating';

interface PostCardProps {
  post: ContentCardData;
  onEdit?: (post: ContentCardData) => void;
  onDelete?: (post: ContentCardData) => void;
  onRead?: (post: ContentCardData) => void;
  onShare?: (post: ContentCardData) => void;
  onRatingChange?: (post: ContentCardData, rating: number) => void;
  compact?: boolean;
  isOwnProfile?: boolean; // Свой ли это профиль
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
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

  return (
    <div className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 ${
      compact ? 'p-3' : 'p-4'
    }`}>
      <div className="flex items-start space-x-4">
        {/* Иконка поста */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
          <FaBlog className="w-5 h-5" />
        </div>
        
        {/* Основной контент */}
        <div className="flex-1 min-w-0">
          {/* Заголовок и рейтинг */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  Пост
                </span>
                {post.metadata.category && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 capitalize">
                      {post.metadata.category}
                    </span>
                  </>
                )}
              </div>
              <h4 className="font-semibold text-gray-800 truncate">{post.title}</h4>
            </div>
            <div className="ml-2 flex-shrink-0">
              <StarRating
                rating={post.rating || 0}
                isInteractive={!isOwnProfile && !!onRatingChange}
                onRatingChange={(rating) => onRatingChange?.(post, rating)}
                showNumber={true}
                size="sm"
              />
            </div>
          </div>
          
          {/* Превью поста */}
          <p className={`text-gray-600 mb-3 ${compact ? 'text-sm line-clamp-1' : 'text-sm line-clamp-2'}`}>
            {post.preview}
          </p>
          
          {/* Мини-карта для постов с геолокацией */}
          {post.mapData && (
            <div className="mb-3">
              <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200"></div>
                <div className="relative text-center text-gray-600">
                  <FaMapPin className="w-4 h-4 mx-auto mb-1" />
                  <div className="text-xs font-medium">Местоположение</div>
                  <div className="text-xs opacity-75">
                    {post.mapData.lat.toFixed(2)}, {post.mapData.lng.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Статистика */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <FaEye className="w-4 h-4" />
              <span>{post.stats.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaHeart className="w-4 h-4" />
              <span>{post.stats.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaComment className="w-4 h-4" />
              <span>{post.stats.comments}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaShare className="w-4 h-4" />
              <span>{post.stats.shares}</span>
            </div>
          </div>
          
          {/* Теги */}
          {post.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.metadata.tags.slice(0, compact ? 2 : 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {post.metadata.tags.length > (compact ? 2 : 3) && (
                <span className="text-gray-400 text-xs px-2 py-1">
                  +{post.metadata.tags.length - (compact ? 2 : 3)}
                </span>
              )}
            </div>
          )}
          
          {/* Действия */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {formatDate(post.metadata.createdAt)}
            </div>
            
            <div className="flex items-center space-x-2">
              {post.interactive.canRead && onRead && (
                <button
                  onClick={() => onRead(post)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  Читать
                </button>
              )}
              
              {post.interactive.canEdit && onEdit && (
                <button
                  onClick={() => onEdit(post)}
                  className="text-gray-600 hover:text-gray-700 p-1 rounded transition-colors"
                  title="Редактировать"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
              )}
              
              {post.interactive.canShare && onShare && (
                <button
                  onClick={() => onShare(post)}
                  className="text-green-600 hover:text-green-700 p-1 rounded transition-colors"
                  title="Поделиться"
                >
                  <FaShare className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(post)}
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

export default PostCard;
