import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../../types/chat';
import { Reply, MoreVertical, Smile, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

interface MessageItemProps {
  message: Message;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  isOwn: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onReply,
  onReact,
  onEdit,
  onDelete,
  isOwn
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const actionsRef = useRef<HTMLDivElement>(null);
  const reactionsRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Обновляем editContent при изменении message.content
  useEffect(() => {
    setEditContent(message.content);
  }, [message.content]);

  // Фокус на textarea при начале редактирования
  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.select();
    }
  }, [isEditing]);

  // Закрытие меню при клике вне их области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
      if (reactionsRef.current && !reactionsRef.current.contains(event.target as Node)) {
        setShowReactions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleReaction = (emoji: string) => {
    onReact(message.id, emoji);
    setShowReactions(false);
  };

  const canEdit = message.canEdit && isOwn;
  const canDelete = message.canDelete && isOwn;

  return (
    <div className={`message-item ${isOwn ? 'own' : 'other'} mb-6 p-2 hover:bg-gray-50 rounded-lg transition-all duration-200`}>
      {/* Ответ на сообщение */}
      {message.replyTo && (
        <div className="reply-preview mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-400 shadow-sm">
          <div className="text-xs text-blue-600 mb-1 font-medium">
            Ответ на сообщение {message.replyTo.author.name}
          </div>
          <div className="text-sm text-blue-800 truncate">
            {message.replyTo.content}
          </div>
        </div>
      )}

      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        {/* Аватар (только для чужих сообщений) */}
        {!isOwn && (
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white">
                {message.author.name.charAt(0).toUpperCase()}
            </div>
            </div>
        )}

        {/* Сообщение */}
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
          {/* Имя автора (только для чужих сообщений) */}
          {!isOwn && (
            <div className="text-xs text-gray-600 mb-2 ml-1 font-medium">
              {message.author.name}
          </div>
        )}
        
          {/* Контент сообщения */}
          <div className={`rounded-2xl px-4 py-3 shadow-sm ${
            isOwn 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
              : 'bg-white text-gray-900 border border-gray-200'
          }`}>
            {isEditing ? (
              <div className="space-y-3 p-3 bg-white rounded-lg border-2 border-blue-300 shadow-lg">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 border-2 border-blue-200 rounded-lg resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  rows={3}
                  autoFocus
                  ref={editTextareaRef}
                  placeholder="Редактируйте сообщение..."
                  onKeyDown={handleKeyDown}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Нажмите Enter для сохранения, Esc для отмены
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={handleEdit}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Сохранить
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      className="border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="break-words">
                {message.content}
          {message.isEdited && (
                  <span className="inline-block ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full border border-gray-200 edit-indicator">
                    ✏️ ред.
            </span>
                )}
              </div>
            )}
          </div>

          {/* Реакции */}
          {message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 ml-1">
              {message.reactions.map((reaction) => (
                <span
                  key={`${reaction.emoji}-${reaction.users.join(',')}`}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 hover:bg-blue-100 cursor-pointer transition-all duration-200 shadow-sm"
                >
                  <span className="text-lg">{reaction.emoji}</span>
                  <span className="text-blue-700 font-medium">{reaction.users.length}</span>
                </span>
              ))}
            </div>
          )}

          {/* Время и действия */}
          <div className={`flex items-center space-x-3 mt-3 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full message-time">
              {message.timestamp.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            
            {/* Кнопки действий */}
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReply(message)}
                className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 rounded-full transition-all duration-200"
                title="Ответить"
              >
                <Reply size={16} />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowReactions(!showReactions)}
                className="h-8 w-8 p-0 hover:bg-yellow-100 hover:text-yellow-600 rounded-full transition-all duration-200"
                title="Реакция"
              >
                <Smile size={16} />
              </Button>

              {/* Кнопка действий */}
              {(canEdit || canDelete) && (
                <div className="relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowActions(!showActions)}
                    className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-all duration-200"
                    title="Действия"
                  >
                    <MoreVertical size={16} />
                  </Button>
                  
                  {/* Выпадающее меню действий */}
                  {showActions && (
                    <div className="absolute bottom-full right-0 mb-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl p-2 min-w-[140px] z-50">
                      {canEdit && (
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowActions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 rounded-lg flex items-center space-x-2 transition-all duration-200"
                        >
                          <Edit size={14} className="text-blue-500" />
                          <span>Редактировать</span>
                        </button>
                      )}
                      
                      {canDelete && (
                        <button
                          onClick={() => {
                            onDelete(message.id);
                            setShowActions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 hover:text-red-600 rounded-lg flex items-center space-x-2 transition-all duration-200"
                        >
                          <Trash2 size={14} className="text-red-500" />
                          <span>Удалить</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Панель реакций */}
          {showReactions && (
            <div className="reactions-panel mt-3 p-4 bg-white border-2 border-yellow-200 rounded-xl shadow-xl" ref={reactionsRef}>
              <div className="mb-2 text-sm font-medium text-gray-700">Выберите реакцию:</div>
              <div className="grid grid-cols-6 gap-3">
                {['👍', '❤️', '😊', '🎉', '👏', '🔥', '😮', '😢', '😡', '🤔', '👀', '💯'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="text-2xl hover:scale-125 transition-all duration-200 p-2 rounded-lg hover:bg-yellow-50 hover:shadow-md"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Аватар (только для своих сообщений) */}
        {isOwn && (
          <div className="flex-shrink-0 ml-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white">
              {message.author.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
