import React, { useState } from 'react';
import { FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { CoordinateInputData } from '../../types/routeBuilder';

interface CoordinateInputProps {
  onAdd: (data: CoordinateInputData) => void;
  onClose: () => void;
}

const CoordinateInput: React.FC<CoordinateInputProps> = ({ onAdd, onClose }) => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    
    // Валидация координат
    if (isNaN(lat) || isNaN(lon)) {
      alert('❌ Пожалуйста, введите корректные числовые координаты');
      return;
    }
    
    if (lat < -90 || lat > 90) {
      alert('❌ Широта должна быть от -90 до 90 градусов');
      return;
    }
    
    if (lon < -180 || lon > 180) {
      alert('❌ Долгота должна быть от -180 до 180 градусов');
      return;
    }
    
    if (!title.trim()) {
      alert('❌ Пожалуйста, введите название точки');
      return;
    }
    
    onAdd({
      latitude: lat,
      longitude: lon,
      title: title.trim(),
      description: description.trim() || undefined
    });
    
    // Очищаем форму
    setLatitude('');
    setLongitude('');
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <FaMapMarkerAlt className="mr-2 text-blue-500" />
            Ввод координат
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Широта (latitude) *
            </label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="55.7558"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              От -90 до 90 градусов
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Долгота (longitude) *
            </label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="37.6173"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              От -180 до 180 градусов
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название точки *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Гостиница 'Уфа'"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание (необязательно)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Дополнительная информация о точке"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Добавить точку
            </button>
          </div>
        </form>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            💡 <strong>Совет:</strong> Координаты можно скопировать из Google Maps, Яндекс.Карт или других картографических сервисов.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoordinateInput;
