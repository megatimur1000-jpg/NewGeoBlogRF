import React, { useState, useMemo } from 'react';
import { Search, X, Filter, Calendar, User } from 'lucide-react';
import { Message, User as UserType } from '../../types/chat';

interface MessageSearchProps {
  messages: Message[];
  currentUser: UserType;
  onMessageSelect: (message: Message) => void;
}

interface SearchFilters {
  text: string;
  author: string;
  dateFrom: string;
  dateTo: string;
  hasReactions: boolean;
  hasAttachments: boolean;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
  messages,
  currentUser,
  onMessageSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    text: '',
    author: '',
    dateFrom: '',
    dateTo: '',
    hasReactions: false,
    hasAttachments: false
  });
  const [showFilters, setShowFilters] = useState(false);

  // Получаем уникальных авторов для фильтра
  const authors = useMemo(() => {
    const uniqueAuthors = new Set(messages.map(msg => msg.author.name));
    return Array.from(uniqueAuthors).sort();
  }, [messages]);

  // Фильтрация сообщений
  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      // Поиск по тексту
      if (filters.text && !message.content.toLowerCase().includes(filters.text.toLowerCase())) {
        return false;
      }

      // Фильтр по автору
      if (filters.author && message.author.name !== filters.author) {
        return false;
      }

      // Фильтр по дате
      if (filters.dateFrom) {
        const messageDate = new Date(message.timestamp);
        const fromDate = new Date(filters.dateFrom);
        if (messageDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const messageDate = new Date(message.timestamp);
        const toDate = new Date(filters.dateTo);
        if (messageDate > toDate) return false;
      }

      // Фильтр по реакциям
      if (filters.hasReactions && message.reactions.length === 0) {
        return false;
      }

      // Фильтр по вложениям
      if (filters.hasAttachments && (!message.attachments || message.attachments.length === 0)) {
        return false;
      }

      return true;
    });
  }, [messages, filters]);

  // Сброс фильтров
  const resetFilters = () => {
    setFilters({
      text: '',
      author: '',
      dateFrom: '',
      dateTo: '',
      hasReactions: false,
      hasAttachments: false
    });
  };

  // Форматирование даты
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Подсветка найденного текста
  const highlightText = (text: string, searchText: string) => {
    if (!searchText) return text;
    
    const regex = new RegExp(`(${searchText})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  };

  // Проверка прав доступа текущего пользователя
  const canViewMessage = (_message: Message) => {
    // Текущий пользователь может видеть все сообщения
    return currentUser && currentUser.id;
  };

  return (
    <div className="message-search">
      {/* Кнопка поиска */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-modern"
        title="Поиск сообщений"
      >
        <Search size={16} />
        Поиск
      </button>

      {/* Панель поиска */}
      {isOpen && (
        <div className="search-panel">
          <div className="search-header">
            <h3>Поиск сообщений</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="btn-modern"
            >
              <X size={16} />
            </button>
          </div>

          {/* Основной поиск */}
          <div className="search-input-group">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Поиск по тексту сообщения..."
                value={filters.text}
                onChange={(e) => setFilters(prev => ({ ...prev, text: e.target.value }))}
                className="search-input"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-modern"
            >
              <Filter size={16} />
              Фильтры
            </button>
          </div>

          {/* Расширенные фильтры */}
          {showFilters && (
            <div className="search-filters">
              <div className="filter-row">
                <div className="filter-group">
                  <label>Автор:</label>
                  <select
                    value={filters.author}
                    onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
                    className="filter-select"
                  >
                    <option value="">Все авторы</option>
                    {authors.map(author => (
                      <option key={author} value={author}>{author}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Дата от:</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="filter-input"
                  />
                </div>

                <div className="filter-group">
                  <label>Дата до:</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="filter-input"
                  />
                </div>
              </div>

              <div className="filter-row">
                <div className="filter-checkbox">
                  <input
                    type="checkbox"
                    id="hasReactions"
                    checked={filters.hasReactions}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasReactions: e.target.checked }))}
                  />
                  <label htmlFor="hasReactions">Только с реакциями</label>
                </div>

                <div className="filter-checkbox">
                  <input
                    type="checkbox"
                    id="hasAttachments"
                    checked={filters.hasAttachments}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasAttachments: e.target.checked }))}
                  />
                  <label htmlFor="hasAttachments">Только с вложениями</label>
                </div>
              </div>

              <button
                onClick={resetFilters}
                className="btn-modern"
              >
                Сбросить фильтры
              </button>
            </div>
          )}

          {/* Результаты поиска */}
          <div className="search-results">
            <div className="results-header">
              <span>Найдено: {filteredMessages.length}</span>
              {filters.text && (
                <span className="search-query">
                  По запросу: "{filters.text}"
                </span>
              )}
            </div>

            <div className="results-list">
              {filteredMessages.length === 0 ? (
                <div className="no-results">
                  <p>Сообщения не найдены</p>
                  <p>Попробуйте изменить параметры поиска</p>
                </div>
              ) : (
                filteredMessages
                  .filter(message => canViewMessage(message))
                  .map(message => (
                  <div
                    key={message.id}
                    className="search-result-item"
                    onClick={() => onMessageSelect(message)}
                  >
                    <div className="result-header">
                      <div className="result-author">
                        <User size={14} />
                        {message.author.name}
                      </div>
                      <div className="result-date">
                        <Calendar size={14} />
                        {formatDate(message.timestamp)}
                      </div>
                    </div>
                    
                    <div 
                      className="result-content"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(message.content, filters.text)
                      }}
                    />
                    
                    {message.reactions.length > 0 && (
                      <div className="result-reactions">
                        {message.reactions.map(reaction => (
                          <span key={`${reaction.emoji}-${reaction.users.join(',')}`} className="reaction-emoji">
                            {reaction.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="result-attachments">
                        📎 {message.attachments.length} вложение(й)
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageSearch;
