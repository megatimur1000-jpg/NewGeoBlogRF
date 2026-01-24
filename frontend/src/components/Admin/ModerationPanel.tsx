import React, { useState, useEffect } from 'react';
import AIModerationPanel from './AIModerationPanel';

const ModerationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai' | 'history'>('ai');

  return (
    <div className="w-full">
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ai'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Модерация
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            История
          </button>
        </div>
      </div>

      {activeTab === 'ai' ? (
        <AIModerationPanel />
      ) : (
        <div className="text-center py-12 text-gray-500">
          История модерации
        </div>
      )}
    </div>
  );
};

export default ModerationPanel;
