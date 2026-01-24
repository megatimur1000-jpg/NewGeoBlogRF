/**
 * Компонент с крупными городами России
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RUSSIA_MAJOR_CITIES } from '../../utils/russiaBounds';

interface RussiaCitiesProps {
  maxItems?: number;
  showTitle?: boolean;
  showSearch?: boolean;
}

const RussiaCities: React.FC<RussiaCitiesProps> = ({ 
  maxItems = 15, 
  showTitle = true,
  showSearch = true
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleCityClick = (city: any) => {
    // Переходим на карту с фокусом на этот город
    navigate('/map', { 
      state: { 
        focusLocation: { 
          lat: city.lat, 
          lng: city.lng, 
          zoom: 10,
          title: city.name 
        } 
      } 
    });
  };

  // Фильтруем города по поисковому запросу
  const filteredCities = RUSSIA_MAJOR_CITIES.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, maxItems);

  const getCitySize = (index: number) => {
    if (index < 3) return 'text-2xl font-bold'; // Топ-3 города
    if (index < 10) return 'text-lg font-semibold'; // Топ-10
    return 'text-base font-medium'; // Остальные
  };

  const getCityIcon = (index: number) => {
    const iconClass = "text-3xl text-blue-600";
    if (index === 0) return <i className={`fas fa-trophy ${iconClass}`}></i>; // Москва
    if (index === 1) return <i className={`fas fa-theater-masks ${iconClass}`}></i>; // СПб
    if (index < 5) return <i className={`fas fa-star ${iconClass}`}></i>; // Топ-5
    return <i className={`fas fa-city ${iconClass}`}></i>; // Остальные
  };

  return (
    <div className="w-full">
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            <i className="fas fa-city text-blue-600"></i> Крупные города России
          </h2>
          <p className="text-gray-600">
            Откройте для себя главные города нашей страны
          </p>
        </div>
      )}

      {showSearch && (
        <div className="mb-6">
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Поиск города..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCities.map((city, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border-l-4 border-blue-500"
            onClick={() => handleCityClick(city)}
          >
            <div className="flex items-center space-x-3">
              <div className="group-hover:scale-110 transition-transform duration-300 flex items-center">
                {getCityIcon(index)}
              </div>
              
              <div className="flex-1">
                <h3 className={`text-gray-900 group-hover:text-blue-600 transition-colors ${getCitySize(index)}`}>
                  {city.name}
                </h3>
                
                <div className="text-sm text-gray-500 mt-1">
                  {index + 1} по населению в России
                </div>
                
                <div className="text-xs text-gray-400 mt-1">
                  {city.lat.toFixed(4)}°, {city.lng.toFixed(4)}°
                </div>
              </div>
              
              <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Городы не найдены</p>
        </div>
      )}

      <div className="text-center mt-8">
        <button
          onClick={() => navigate('/map')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        >
          Посмотреть все города на карте
        </button>
      </div>
    </div>
  );
};

export default RussiaCities;
