/**
 * Главный компонент российского контента
 */

import React, { useState } from 'react';
import RussiaTouristPlaces from './RussiaTouristPlaces';
import RussiaRegions from './RussiaRegions';
import RussiaCities from './RussiaCities';
import RussiaFeaturedBlogs from './RussiaFeaturedBlogs';

interface RussiaContentProps {
  showAll?: boolean;
}

const RussiaContent: React.FC<RussiaContentProps> = ({ showAll = true }) => {
  const [activeTab, setActiveTab] = useState<'places' | 'regions' | 'cities'>('places');

  const tabs = [
    { id: 'places' as const, label: 'Достопримечательности', icon: '🏛️' },
    { id: 'regions' as const, label: 'Регионы', icon: '🗺️' },
    { id: 'cities' as const, label: 'Города', icon: '🏙️' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🇷🇺 Россия - страна возможностей
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Откройте для себя удивительные места, богатую культуру и разнообразие регионов нашей необъятной страны
        </p>
      </div>

      {showAll && (
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="bg-gray-100 rounded-lg p-1 inline-flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="min-h-96">
        {showAll ? (
          <>
            {activeTab === 'places' && <RussiaTouristPlaces />}
            {activeTab === 'regions' && <RussiaRegions />}
            {activeTab === 'cities' && <RussiaCities />}
          </>
        ) : (
          <div className="space-y-12">
            <RussiaTouristPlaces maxItems={6} />
            <RussiaFeaturedBlogs maxItems={4} />
            <RussiaRegions maxItems={4} />
            <RussiaCities maxItems={9} showSearch={false} />
          </div>
        )}
      </div>

      {/* Статистика по России */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Россия в цифрах
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">85</div>
            <p className="text-gray-600">Федеральных субъектов</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">1,111</div>
            <p className="text-gray-600">Городов</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">17,098,242</div>
            <p className="text-gray-600">км² территории</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">146</div>
            <p className="text-gray-600">млн человек населения</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RussiaContent;
