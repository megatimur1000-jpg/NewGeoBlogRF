import React, { useState, useMemo } from 'react';
import { Room, User } from '../../types/chat';
import { 
  FaChevronRight, 
  FaComments, 
  FaRoute, 
  FaCalendar, 
  FaUsers, 
  FaLock, 
  FaEllipsisH,
  FaMapMarkerAlt,
  FaClock,
  FaTag,
  FaArchive,
  FaTrash,
  FaPlus,
  FaTimes
} from 'react-icons/fa';
import { MdOutlineRestore } from 'react-icons/md';

interface RoomAccordionProps {
  rooms: Room[];
  currentRoom: Room | null;
  currentUser: User;
  onRoomSelect: (room: Room) => void;
  onCreateRoom: (roomData: any) => void;
  onCreateRouteRoom?: (roomData: any) => void;
  onCreateEventRoom?: (roomData: any) => void;
  onArchiveRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onRestoreRoom: (roomId: string) => void;
  onUnarchiveRoom: (roomId: string) => void;
  onJoinRoom?: (roomId: string) => void;
  onLeaveRoom?: (roomId: string) => void;
}

// Категории комнат с иконками и цветами
const ROOM_CATEGORIES = [
  {
    id: 'route',
    name: '🗺️ Маршруты',
    icon: <FaRoute />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Обсуждение маршрутов и путешествий'
  },
  {
    id: 'event',
    name: '📅 События',
    icon: <FaCalendar />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Планирование встреч и мероприятий'
  },
  {
    id: 'public',
    name: '👥 Общие',
    icon: <FaUsers />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Общие темы для общения'
  },
  {
    id: 'private',
    name: '🔒 Приватные',
    icon: <FaLock />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Закрытые комнаты'
  },
  {
    id: 'other',
    name: '💬 Прочее',
    icon: <FaEllipsisH />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'Различные темы для общения'
  }
];

export const RoomAccordion: React.FC<RoomAccordionProps> = ({
  rooms,
  currentRoom,
  onRoomSelect,
  onCreateRoom,
  onCreateRouteRoom,
  onCreateEventRoom,
  onArchiveRoom,
  onDeleteRoom,
  onUnarchiveRoom,
  onJoinRoom,
  onLeaveRoom,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['route', 'event']);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalType] = useState<'general' | 'route' | 'event'>('general');

  // Группировка комнат по категориям
  const groupedRooms = useMemo(() => {
    const groups: { [key: string]: Room[] } = {
      route: [],
      event: [],
      public: [],
      private: [],
      other: [],
      archived: [],
      deleted: []
    };

    rooms.forEach(room => {
      if (room.isDeleted) {
        groups.deleted.push(room);
      } else if (room.isArchived) {
        groups.archived.push(room);
      } else {
        const category = room.type === 'route' ? 'route' : 
                        room.type === 'event' ? 'event' : 
                        room.type === 'private' ? 'private' : 
                        room.category === 'other' ? 'other' : 'public';
        groups[category].push(room);
      }
    });

    return groups;
  }, [rooms]);

  // Переключение раскрытия категории
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Получение иконки для комнаты
  const getRoomIcon = (room: Room) => {
    switch (room.type) {
      case 'route':
        return <FaRoute className="text-blue-500" />;
      case 'event':
        return <FaCalendar className="text-green-500" />;
      case 'private':
        return <FaLock className="text-orange-500" />;
      default:
        return <FaComments className="text-purple-500" />;
    }
  };

  // Получение статуса комнаты
  const getRoomStatus = (room: Room) => {
    if (room.isDeleted) return 'deleted';
    if (room.isArchived) return 'archived';
    if (room.type === 'event' && room.startDate && room.endDate) {
      const now = new Date();
      if (now < room.startDate) return 'upcoming';
      if (now >= room.startDate && now <= room.endDate) return 'active';
      return 'ended';
    }
    return 'active';
  };

  // Получение цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'ended': return 'text-gray-500 bg-gray-100';
      case 'archived': return 'text-orange-500 bg-orange-100';
      case 'deleted': return 'text-red-500 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Форматирование даты
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Заголовок */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Комнаты чата</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <FaPlus size={16} />
          </button>
        </div>
      </div>

      {/* Аккордеон комнат */}
      <div className="flex-1 overflow-y-auto">
        {ROOM_CATEGORIES.map(category => {
          const roomsInCategory = groupedRooms[category.id];
          const isExpanded = expandedCategories.includes(category.id);
          const hasRooms = roomsInCategory.length > 0;

          return (
            <div key={category.id} className="border-b border-gray-100">
              {/* Заголовок категории */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  hasRooms ? 'cursor-pointer' : 'cursor-default opacity-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${category.bgColor} ${category.borderColor} border`}>
                    {category.icon}
                  </div>
                  <div className="text-left">
                    <h3 className={`font-medium ${category.color}`}>{category.name}</h3>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {hasRooms && (
                    <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                      {roomsInCategory.length}
                    </span>
                  )}
                  {hasRooms && (
                    <div className={`transform transition-transform duration-200 ${
                      isExpanded ? 'rotate-90' : ''
                    }`}>
                      <FaChevronRight size={12} className="text-gray-400" />
                    </div>
                  )}
                </div>
              </button>

              {/* Содержимое категории */}
              {isExpanded && hasRooms && (
                <div className="bg-gray-50 border-t border-gray-100">
                  {roomsInCategory.map(room => {
                    const status = getRoomStatus(room);
                    const statusColor = getStatusColor(status);
                    const isSelected = currentRoom?.id === room.id;

                    return (
                      <div
                        key={room.id}
                        className={`p-3 border-l-4 transition-all duration-200 cursor-pointer hover:bg-white ${
                          isSelected 
                            ? 'bg-blue-50 border-l-blue-500' 
                            : 'border-l-transparent hover:border-l-gray-300'
                        }`}
                        onClick={() => onRoomSelect(room)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getRoomIcon(room)}
                              <h4 className="font-medium text-gray-900 truncate">{room.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
                                {status === 'active' && 'Активна'}
                                {status === 'upcoming' && 'Скоро'}
                                {status === 'ended' && 'Завершена'}
                                {status === 'archived' && 'Архив'}
                                {status === 'deleted' && 'Удалена'}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{room.description}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <FaUsers size={10} />
                                {room.participants.length}
                              </div>
                              
                              {room.location && (
                                <div className="flex items-center gap-1">
                                  <FaMapMarkerAlt size={10} />
                                  {room.location.city}
                                </div>
                              )}
                              
                              {room.startDate && (
                                <div className="flex items-center gap-1">
                                  <FaClock size={10} />
                                  {formatDate(room.startDate)}
                                </div>
                              )}
                              
                              {room.category && room.category !== 'other' && (
                                <div className="flex items-center gap-1">
                                  <FaTag size={10} />
                                  {room.category}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Действия */}
                          <div className="flex flex-col gap-1 ml-2">
                            {onJoinRoom && room.type === 'event' && status === 'upcoming' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onJoinRoom(room.id);
                                }}
                                className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="Присоединиться"
                              >
                                <FaPlus size={10} />
                              </button>
                            )}
                            
                            {onLeaveRoom && room.type === 'event' && status === 'upcoming' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onLeaveRoom(room.id);
                                }}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Покинуть"
                              >
                                <FaTimes size={10} />
                              </button>
                            )}
                            
                            {!room.isArchived && !room.isDeleted && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onArchiveRoom(room.id);
                                }}
                                className="p-1 text-orange-600 hover:bg-orange-100 rounded transition-colors"
                                title="Архивировать"
                              >
                                <FaArchive size={10} />
                              </button>
                            )}
                            
                            {room.isArchived && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUnarchiveRoom(room.id);
                                }}
                                className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="Восстановить"
                              >
                                <MdOutlineRestore size={10} />
                              </button>
                            )}
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteRoom(room.id);
                              }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title={room.isDeleted ? "Удалить навсегда" : "Удалить"}
                            >
                              <FaTrash size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Архив */}
        {groupedRooms.archived.length > 0 && (
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleCategory('archived')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-orange-50 border border-orange-200">
                  <FaArchive className="text-orange-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-orange-600">📦 Архив</h3>
                  <p className="text-xs text-gray-500">Заархивированные комнаты</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                  {groupedRooms.archived.length}
                </span>
                <div className={`transform transition-transform duration-200 ${
                  expandedCategories.includes('archived') ? 'rotate-90' : ''
                }`}>
                  <FaChevronRight size={12} className="text-gray-400" />
                </div>
              </div>
            </button>

            {expandedCategories.includes('archived') && (
              <div className="bg-orange-50 border-t border-orange-100">
                {groupedRooms.archived.map(room => (
                  <div
                    key={room.id}
                    className="p-3 border-l-4 border-l-orange-300 cursor-pointer hover:bg-orange-100 transition-colors"
                    onClick={() => onRoomSelect(room)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getRoomIcon(room)}
                      <h4 className="font-medium text-gray-900 truncate">{room.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{room.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Корзина */}
        {groupedRooms.deleted.length > 0 && (
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleCategory('deleted')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-50 border border-red-200">
                  <FaTrash className="text-red-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-red-600">🗑️ Корзина</h3>
                  <p className="text-xs text-gray-500">Удаленные комнаты</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                  {groupedRooms.deleted.length}
                </span>
                <div className={`transform transition-transform duration-200 ${
                  expandedCategories.includes('deleted') ? 'rotate-90' : ''
                }`}>
                  <FaChevronRight size={12} className="text-gray-400" />
                </div>
              </div>
            </button>

            {expandedCategories.includes('deleted') && (
              <div className="bg-red-50 border-t border-red-100">
                {groupedRooms.deleted.map(room => (
                  <div
                    key={room.id}
                    className="p-3 border-l-4 border-l-red-300 cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => onRoomSelect(room)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getRoomIcon(room)}
                      <h4 className="font-medium text-gray-900 truncate">{room.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{room.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Пустое состояние */}
        {Object.values(groupedRooms).every(rooms => rooms.length === 0) && (
          <div className="p-8 text-center text-gray-500">
            <FaComments size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Нет комнат</p>
            <p className="text-sm">Создайте первую комнату для начала общения</p>
          </div>
        )}
      </div>

      {/* Модальное окно создания комнаты */}
      {showCreateModal && (
        <CreateRoomModal
          type={createModalType}
          onClose={() => setShowCreateModal(false)}
          onCreateGeneral={onCreateRoom}
          onCreateRoute={onCreateRouteRoom}
          onCreateEvent={onCreateEventRoom}
        />
      )}
    </div>
  );
};

// Модальное окно создания комнаты (упрощенная версия)
interface CreateRoomModalProps {
  type: 'general' | 'route' | 'event';
  onClose: () => void;
  onCreateGeneral: (data: any) => void;
  onCreateRoute?: (data: any) => void;
  onCreateEvent?: (data: any) => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  type,
  onClose,
  onCreateGeneral,
  onCreateRoute,
  onCreateEvent,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPrivate: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    switch (type) {
      case 'general':
        onCreateGeneral({
          name: formData.name,
          description: formData.description,
          type: formData.isPrivate ? 'private' : 'public',
          isArchived: false,
        });
        break;
      case 'route':
        if (onCreateRoute) {
          onCreateRoute({
            name: formData.name,
            description: formData.description,
            routeId: Date.now().toString(),
            routeData: {
              title: formData.name,
              description: formData.description,
              waypoints: [],
            },
            category: formData.category || 'other',
            isPrivate: formData.isPrivate,
          });
        }
        break;
      case 'event':
        if (onCreateEvent) {
          onCreateEvent({
            name: formData.name,
            description: formData.description,
            eventData: {
              title: formData.name,
              description: formData.description,
              location: {
                address: 'Не указано',
                coordinates: [0, 0],
              },
              startDate: new Date(),
              endDate: new Date(),
              maxParticipants: 10,
              currentParticipants: 1,
              category: 'meetup',
              organizer: { id: '1', name: 'Текущий пользователь', avatar: null, status: 'online', role: 'member', joinedAt: new Date() },
            },
            category: formData.category || 'other',
            isPrivate: formData.isPrivate,
          });
        }
        break;
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {type === 'general' && 'Создать комнату'}
            {type === 'route' && 'Создать комнату маршрута'}
            {type === 'event' && 'Создать комнату события'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название комнаты
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Категория
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите категорию</option>
              <option value="general">Общие</option>
              <option value="travel">Путешествия</option>
              <option value="culture">Культура</option>
              <option value="food">Еда</option>
              <option value="adventure">Приключения</option>
              <option value="relaxation">Отдых</option>
              <option value="other">Прочее</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isPrivate" className="text-sm text-gray-700">
              Приватная комната
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};









