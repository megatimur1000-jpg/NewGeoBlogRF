/**
 * Компонент с популярными туристическими местами России
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RUSSIA_TOURIST_ATTRACTIONS } from '../../config/russia';

interface RussiaTouristPlacesProps {
  maxItems?: number;
  showTitle?: boolean;
}

const RussiaTouristPlaces: React.FC<RussiaTouristPlacesProps> = ({ 
  maxItems = 8, 
  showTitle = true 
}) => {
  const navigate = useNavigate();

  const handlePlaceClick = (place: any) => {
    // Переходим на карту с фокусом на это место
    navigate('/map', { 
      state: { 
        focusLocation: { 
          lat: place.lat, 
          lng: place.lng, 
          zoom: 12,
          title: place.name 
        } 
      } 
    });
  };

  const getPlaceIcon = (type: string) => {
    const iconClass = "text-4xl text-blue-600";
    switch (type) {
      case 'historical':
        return <i className={`fas fa-monument ${iconClass}`}></i>;
      case 'museum':
        return <i className={`fas fa-university ${iconClass}`}></i>;
      case 'nature':
        return <i className={`fas fa-mountain ${iconClass}`}></i>;
      case 'religious':
        return <i className={`fas fa-place-of-worship ${iconClass}`}></i>;
      case 'entertainment':
        return <i className={`fas fa-theater-masks ${iconClass}`}></i>;
      default:
        return <i className={`fas fa-map-marker-alt ${iconClass}`}></i>;
    }
  };

  return (
    <div className="w-full">
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            <i className="fas fa-heart text-red-600"></i> Популярные места России
          </h2>
          <p className="text-gray-600">
            Откройте для себя красоты нашей необъятной страны
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {RUSSIA_TOURIST_ATTRACTIONS.slice(0, maxItems).map((place, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
            onClick={() => handlePlaceClick(place)}
          >
            <div className="text-center">
              <div className="mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center items-center">
                {getPlaceIcon(place.type)}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {place.name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3">
                {place.city}
              </p>
              
              <div className="flex items-center justify-center text-xs text-gray-500">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {place.type === 'historical' && 'Историческое место'}
                  {place.type === 'museum' && 'Музей'}
                  {place.type === 'nature' && 'Природа'}
                  {place.type === 'religious' && 'Религиозное место'}
                  {place.type === 'entertainment' && 'Развлечения'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {maxItems < RUSSIA_TOURIST_ATTRACTIONS.length && (
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/map')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Посмотреть все места на карте
          </button>
        </div>
      )}
    </div>
  );
};

export default RussiaTouristPlaces;
