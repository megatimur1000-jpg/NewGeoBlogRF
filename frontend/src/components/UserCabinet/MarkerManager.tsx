import React, { useState } from 'react';
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaUsers, FaGlobe, FaLock, FaSearch, FaFilter, FaMapMarkerAlt, FaLandmark, FaUtensils, FaHotel, FaShoppingBag, FaBus, FaMapPin } from 'react-icons/fa';

interface Marker {
  id: string;
  title: string;
  description?: string;
  category: string;
  visibility: 'private' | 'public' | 'friends';
  latitude: number;
  longitude: number;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

interface MarkerManagerProps {
  markers: Marker[];
  onEditMarker: (marker: Marker) => void;
  onDeleteMarker: (markerId: string) => void;
  onTransferMarker: (markerId: string, newCategory: string) => void;
  onChangeVisibility: (markerId: string, visibility: 'private' | 'public' | 'friends') => void;
}

const CATEGORIES = [
  { id: 'attraction', name: 'Достопримечательности', icon: <FaLandmark className="text-gray-600" size={16} />, color: 'blue' },
  { id: 'restaurant', name: 'Рестораны', icon: <FaUtensils className="text-gray-600" size={16} />, color: 'green' },
  { id: 'hotel', name: 'Отели', icon: <FaHotel className="text-gray-600" size={16} />, color: 'purple' },
  { id: 'shop', name: 'Магазины', icon: <FaShoppingBag className="text-gray-600" size={16} />, color: 'orange' },
  { id: 'transport', name: 'Транспорт', icon: <FaBus className="text-gray-600" size={16} />, color: 'red' },
  { id: 'other', name: 'Прочее', icon: <FaMapPin className="text-gray-600" size={16} />, color: 'gray' }
];

const MarkerManager: React.FC<MarkerManagerProps> = ({
  markers,
  onEditMarker,
  onDeleteMarker,
  onTransferMarker,
  onChangeVisibility
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'updatedAt'>('updatedAt');

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private': return <FaLock className="text-gray-500" />;
      case 'public': return <FaGlobe className="text-blue-500" />;
      case 'friends': return <FaUsers className="text-green-500" />;
      default: return <FaLock className="text-gray-500" />;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'private': return 'Приватная';
      case 'public': return 'Публичная';
      case 'friends': return 'Для друзей';
      default: return 'Приватная';
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[5];
  };

  const filteredMarkers = markers.filter(marker => {
    const matchesSearch = marker.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         marker.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         marker.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || marker.category === selectedCategory;
    const matchesVisibility = selectedVisibility === 'all' || marker.visibility === selectedVisibility;
    
    return matchesSearch && matchesCategory && matchesVisibility;
  });

  const sortedMarkers = [...filteredMarkers].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'updatedAt':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Управление метками</h2>
        <div className="text-sm text-gray-500">
          {sortedMarkers.length} из {markers.length} меток
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Поиск */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск меток..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Фильтр по категории */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Все категории</option>
            {CATEGORIES.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Фильтр по видимости */}
          <select
            value={selectedVisibility}
            onChange={(e) => setSelectedVisibility(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Вся видимость</option>
            <option value="private">Приватные</option>
            <option value="friends">Для друзей</option>
            <option value="public">Публичные</option>
          </select>

          {/* Сортировка */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="updatedAt">По дате обновления</option>
            <option value="createdAt">По дате создания</option>
            <option value="title">По названию</option>
          </select>
        </div>
      </div>

      {/* Список меток */}
      <div className="space-y-3">
        {sortedMarkers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaMapMarkerAlt className="mx-auto text-4xl mb-4 text-gray-300" />
            <p>Метки не найдены</p>
            <p className="text-sm">Попробуйте изменить фильтры поиска</p>
          </div>
        ) : (
          sortedMarkers.map(marker => {
            const categoryInfo = getCategoryInfo(marker.category);
            return (
              <div
                key={marker.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                        {categoryInfo.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{marker.title}</h3>
                        <p className="text-sm text-gray-600">{categoryInfo.name}</p>
                      </div>
                    </div>
                    
                    {marker.description && (
                      <p className="text-sm text-gray-600 mb-2">{marker.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>📍 {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}</span>
                      {marker.address && <span>🏠 {marker.address}</span>}
                      <span>📅 {new Date(marker.updatedAt).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-1">
                        {getVisibilityIcon(marker.visibility)}
                        <span>{getVisibilityLabel(marker.visibility)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Изменение видимости */}
                    <select
                      value={marker.visibility}
                      onChange={(e) => onChangeVisibility(marker.id, e.target.value as any)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="private">Приватная</option>
                      <option value="friends">Для друзей</option>
                      <option value="public">Публичная</option>
                    </select>

                    {/* Перенос в другую категорию */}
                    <select
                      onChange={(e) => onTransferMarker(marker.id, e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Перенести в...</option>
                      {CATEGORIES.filter(cat => cat.id !== marker.category).map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>

                    {/* Кнопки действий */}
                    <button
                      onClick={() => onEditMarker(marker)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      <FaEdit size={14} />
                    </button>
                    
                    <button
                      onClick={() => onDeleteMarker(marker.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MarkerManager;
