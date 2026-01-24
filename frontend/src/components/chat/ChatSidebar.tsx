
import React, { useState, useMemo } from 'react';
import { Room, RoomFilters, CreateRouteRoomData, CreateEventRoomData } from '../../types/chat';
import { FaPlus, FaSearch, FaFilter, FaRoute, FaCalendar, FaComments, FaUsers, FaMapMarkerAlt, FaClock, FaTag, FaTimes } from 'react-icons/fa';
import { MdOutlineArchive, MdOutlineDelete, MdOutlineRestore } from 'react-icons/md';

interface ChatSidebarProps {
  rooms: Room[];
  currentRoom: Room | null;
  currentUser: any;
  onRoomSelect: (room: Room) => void;
  onCreateRoom: (roomData: any) => void;
  onCreateRouteRoom?: (roomData: CreateRouteRoomData) => void;
  onCreateEventRoom?: (roomData: CreateEventRoomData) => void;
  onArchiveRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onRestoreRoom: (roomId: string) => void;
  onUnarchiveRoom: (roomId: string) => void;
  onJoinRoom?: (roomId: string) => void;
  onLeaveRoom?: (roomId: string) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'Все комнаты', icon: <FaComments />, color: 'text-gray-600' },
  { id: 'route', name: 'Маршруты', icon: <FaRoute />, color: 'text-blue-600' },
  { id: 'event', name: 'События', icon: <FaCalendar />, color: 'text-green-600' },
  { id: 'public', name: 'Общие', icon: <FaUsers />, color: 'text-purple-600' },
  { id: 'private', name: 'Приватные', icon: <FaComments />, color: 'text-orange-600' },
];

const EVENT_CATEGORIES = [
  { id: 'meetup', name: 'Встречи', icon: '🤝' },
  { id: 'tour', name: 'Экскурсии', icon: '🗺️' },
  { id: 'workshop', name: 'Мастер-классы', icon: '🎨' },
  { id: 'party', name: 'Вечеринки', icon: '🎉' },
  { id: 'conference', name: 'Конференции', icon: '📚' },
];

const ROUTE_CATEGORIES = [
  { id: 'general', name: 'Общие', icon: '🗺️' },
  { id: 'travel', name: 'Путешествия', icon: '✈️' },
  { id: 'culture', name: 'Культура', icon: '🏛️' },
  { id: 'food', name: 'Еда', icon: '🍕' },
  { id: 'adventure', name: 'Приключения', icon: '🏔️' },
  { id: 'relaxation', name: 'Отдых', icon: '🏖️' },
];

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  rooms,
  currentRoom,
  onRoomSelect,
  onCreateRoom,
  onCreateRouteRoom,
  onCreateEventRoom,
  onArchiveRoom,
  onDeleteRoom,
  onRestoreRoom,
  onUnarchiveRoom,
  onJoinRoom,
  onLeaveRoom,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalType] = useState<'general' | 'route' | 'event'>('general');
  const [filters] = useState<RoomFilters>({});

  // Фильтрация комнат
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // Поиск по названию и описанию
      const matchesSearch = searchTerm === '' || 
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Фильтр по категории
      const matchesCategory = selectedCategory === 'all' || room.type === selectedCategory;

      // Фильтр по статусу
      const matchesStatus = !room.isDeleted && !room.isArchived;

      // Дополнительные фильтры
      const matchesLocation = !filters.location || 
        (room.location?.city.toLowerCase().includes(filters.location.toLowerCase()) ||
         room.location?.country.toLowerCase().includes(filters.location.toLowerCase()));

      const matchesDateRange = !filters.dateRange || 
        (room.startDate && room.endDate &&
         room.startDate >= filters.dateRange.start &&
         room.endDate <= filters.dateRange.end);

      return matchesSearch && matchesCategory && matchesStatus && matchesLocation && matchesDateRange;
    });
  }, [rooms, searchTerm, selectedCategory, filters]);

  // Группировка комнат по типу
  const groupedRooms = useMemo(() => {
    const groups = {
      active: filteredRooms.filter(room => !room.isArchived && !room.isDeleted),
      archived: filteredRooms.filter(room => room.isArchived && !room.isDeleted),
      deleted: filteredRooms.filter(room => room.isDeleted),
    };
    return groups;
  }, [filteredRooms]);



  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getRoomIcon = (room: Room) => {
    switch (room.type) {
      case 'route':
        return <FaRoute className="text-blue-500" />;
      case 'event':
        return <FaCalendar className="text-green-500" />;
      case 'private':
        return <FaComments className="text-orange-500" />;
      default:
        return <FaUsers className="text-purple-500" />;
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'upcoming': return 'text-blue-600';
      case 'ended': return 'text-gray-500';
      case 'archived': return 'text-orange-500';
      case 'deleted': return 'text-red-500';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Заголовок */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Комнаты чата</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaPlus size={16} />
          </button>
        </div>
        
          {/* Поиск */}
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Поиск комнат..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
        {/* Категории */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>

        {/* Фильтры */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaFilter size={14} />
          Фильтры
        </button>
      </div>

      {/* Список комнат */}
      <div className="flex-1 overflow-y-auto">
        {/* Активные комнаты */}
        {groupedRooms.active.length > 0 && (
          <div className="mb-6">
            <h3 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">Активные комнаты</h3>
            {groupedRooms.active.map(room => (
              <RoomItem
                key={room.id}
                room={room}
                isSelected={currentRoom?.id === room.id}
                onSelect={() => onRoomSelect(room)}
                onArchive={() => onArchiveRoom(room.id)}
                onDelete={() => onDeleteRoom(room.id)}
                onJoin={onJoinRoom ? () => onJoinRoom(room.id) : undefined}
                onLeave={onLeaveRoom ? () => onLeaveRoom(room.id) : undefined}
                getRoomIcon={getRoomIcon}
                getRoomStatus={getRoomStatus}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            ))}
            </div>
        )}

        {/* Архивированные комнаты */}
        {groupedRooms.archived.length > 0 && (
          <div className="mb-6">
            <h3 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">Архив</h3>
            {groupedRooms.archived.map(room => (
              <RoomItem
                key={room.id}
                room={room}
                isSelected={currentRoom?.id === room.id}
                onSelect={() => onRoomSelect(room)}
                onArchive={() => onUnarchiveRoom(room.id)}
                onDelete={() => onDeleteRoom(room.id)}
                getRoomIcon={getRoomIcon}
                getRoomStatus={getRoomStatus}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
                formatTime={formatTime}
                isArchived
              />
            ))}
          </div>
        )}

        {/* Удаленные комнаты */}
        {groupedRooms.deleted.length > 0 && (
          <div className="mb-6">
            <h3 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">Корзина</h3>
            {groupedRooms.deleted.map(room => (
              <RoomItem
                key={room.id}
                room={room}
                isSelected={currentRoom?.id === room.id}
                onSelect={() => onRoomSelect(room)}
                onArchive={() => onRestoreRoom(room.id)}
                onDelete={() => onDeleteRoom(room.id)}
                getRoomIcon={getRoomIcon}
                getRoomStatus={getRoomStatus}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
                formatTime={formatTime}
                isDeleted
              />
            ))}
          </div>
        )}

        {filteredRooms.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <FaComments size={48} className="mx-auto mb-2 text-gray-300" />
            <p>Комнаты не найдены</p>
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

// Компонент элемента комнаты
interface RoomItemProps {
  room: Room;
  isSelected: boolean;
  onSelect: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  getRoomIcon: (room: Room) => React.ReactNode;
  getRoomStatus: (room: Room) => string;
  getStatusColor: (status: string) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  isArchived?: boolean;
  isDeleted?: boolean;
}

const RoomItem: React.FC<RoomItemProps> = ({
  room,
  isSelected,
  onSelect,
  onArchive,
  onDelete,
  onJoin,
  onLeave,
  getRoomIcon,
  getRoomStatus,
  getStatusColor,
  formatDate,

  isArchived,
  isDeleted,
}) => {
  const status = getRoomStatus(room);
  const statusColor = getStatusColor(status);

  return (
    <div
      className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getRoomIcon(room)}
            <h4 className="font-medium text-gray-900 truncate">{room.name}</h4>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColor} bg-opacity-10`}>
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
              <FaUsers size={12} />
              {room.participants.length}
            </div>
            
            {room.location && (
              <div className="flex items-center gap-1">
                <FaMapMarkerAlt size={12} />
                {room.location.city}
              </div>
            )}
            
            {room.startDate && (
              <div className="flex items-center gap-1">
                <FaClock size={12} />
                {formatDate(room.startDate)}
              </div>
            )}
            
            {room.category && (
              <div className="flex items-center gap-1">
                <FaTag size={12} />
                {room.category}
              </div>
            )}
          </div>
        </div>

        {/* Действия */}
        <div className="flex flex-col gap-1 ml-2">
          {onJoin && room.type === 'event' && status === 'upcoming' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                onJoin();
                    }}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
              title="Присоединиться"
                  >
              <FaPlus size={12} />
                  </button>
          )}
          
          {onLeave && room.type === 'event' && status === 'upcoming' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                onLeave();
                    }}
              className="p-1 text-red-600 hover:bg-red-100 rounded"
              title="Покинуть"
                  >
              <FaTimes size={12} />
                  </button>
          )}
          
          {!isArchived && !isDeleted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                onArchive();
                        }}
              className="p-1 text-orange-600 hover:bg-orange-100 rounded"
              title="Архивировать"
                      >
              <MdOutlineArchive size={14} />
                      </button>
          )}
          
          {isArchived && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                onArchive();
                        }}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Восстановить"
                      >
              <MdOutlineRestore size={14} />
                      </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title={isDeleted ? "Удалить навсегда" : "Удалить"}
          >
            <MdOutlineDelete size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Модальное окно создания комнаты
interface CreateRoomModalProps {
  type: 'general' | 'route' | 'event';
  onClose: () => void;
  onCreateGeneral: (data: any) => void;
  onCreateRoute?: (data: CreateRouteRoomData) => void;
  onCreateEvent?: (data: CreateEventRoomData) => void;
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
    // Для событий
    startDate: '',
    endDate: '',
    maxParticipants: '10',
    location: '',
    coordinates: '',
    price: '',
    currency: 'RUB',
    // Для маршрутов
    routeId: '',
    routeTitle: '',
    routeDescription: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    switch (type) {
      case 'general':
        onCreateGeneral({
          name: formData.name,
          description: formData.description,
          type: formData.isPrivate ? 'private' : 'public',
        });
        break;
      case 'route':
        if (onCreateRoute) {
          onCreateRoute({
            name: formData.name,
            description: formData.description,
            routeId: formData.routeId,
            routeData: {
              title: formData.routeTitle,
              description: formData.routeDescription,
              waypoints: [],
            },
            category: formData.category,
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
                address: formData.location,
                coordinates: formData.coordinates ? JSON.parse(formData.coordinates) : [0, 0],
              },
              startDate: new Date(formData.startDate),
              endDate: new Date(formData.endDate),
              maxParticipants: parseInt(formData.maxParticipants),
              currentParticipants: 1,
              category: 'meetup',
              organizer: { id: '1', name: 'Текущий пользователь', avatar: null, status: 'online', role: 'member', joinedAt: new Date() },
              price: formData.price ? parseFloat(formData.price) : undefined,
              currency: formData.currency,
            },
            category: formData.category,
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

          {type === 'route' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID маршрута
                </label>
                <input
                  type="text"
                  value={formData.routeId}
                  onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название маршрута
                </label>
                <input
                  type="text"
                  value={formData.routeTitle}
                  onChange={(e) => setFormData({ ...formData, routeTitle: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          )}

          {type === 'event' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата начала
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата окончания
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Место проведения
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Адрес события"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Максимум участников
                </label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="100"
                />
              </div>
            </>
          )}

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
              {type === 'event' && EVENT_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
              {type === 'route' && ROUTE_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
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
              className="flex-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};