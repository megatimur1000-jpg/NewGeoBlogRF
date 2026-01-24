/**
 * Компонент с федеральными округами России
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RUSSIA_REGIONS } from '../../config/russia';

interface RussiaRegionsProps {
  maxItems?: number;
  showTitle?: boolean;
}

const RussiaRegions: React.FC<RussiaRegionsProps> = ({ 
  maxItems = 8, 
  showTitle = true 
}) => {
  const navigate = useNavigate();

  const handleRegionClick = (region: any) => {
    // Переходим на карту с фокусом на этот регион
    navigate('/map', { 
      state: { 
        focusLocation: { 
          lat: region.center.latitude, 
          lng: region.center.longitude, 
          zoom: 6,
          title: region.name 
        } 
      } 
    });
  };

  const getRegionIcon = (regionId: string) => {
    const iconClass = "text-4xl text-blue-600";
    switch (regionId) {
      case 'central':
        return <i className={`fas fa-monument ${iconClass}`}></i>;
      case 'northwestern':
        return <i className={`fas fa-water ${iconClass}`}></i>;
      case 'southern':
        return <i className={`fas fa-sun ${iconClass}`}></i>;
      case 'northcaucasus':
        return <i className={`fas fa-mountain ${iconClass}`}></i>;
      case 'volga':
        return <i className={`fas fa-water ${iconClass}`}></i>;
      case 'ural':
        return <i className={`fas fa-industry ${iconClass}`}></i>;
      case 'siberian':
        return <i className={`fas fa-tree ${iconClass}`}></i>;
      case 'fareastern':
        return <i className={`fas fa-mountain ${iconClass}`}></i>;
      default:
        return <i className={`fas fa-map ${iconClass}`}></i>;
    }
  };

  const regions = Object.values(RUSSIA_REGIONS);

  return (
    <div className="w-full">
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            <i className="fas fa-map-marked-alt text-red-600"></i> Федеральные округа России
          </h2>
          <p className="text-gray-600">
            Исследуйте разнообразие регионов нашей страны
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {regions.slice(0, maxItems).map((region, index) => (
          <div
            key={region.id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
            onClick={() => handleRegionClick(region)}
          >
            <div className="text-center">
              <div className="mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center items-center">
                {getRegionIcon(region.id)}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {region.name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3">
                {region.majorCities.length} крупных городов
              </p>
              
              <div className="space-y-1">
                {region.majorCities.slice(0, 3).map((city, cityIndex) => (
                  <div key={cityIndex} className="text-xs text-gray-500">
                    {city.name}
                  </div>
                ))}
                {region.majorCities.length > 3 && (
                  <div className="text-xs text-gray-400">
                    и еще {region.majorCities.length - 3}...
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => navigate('/map')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        >
          Исследовать все регионы на карте
        </button>
      </div>
    </div>
  );
};

export default RussiaRegions;
