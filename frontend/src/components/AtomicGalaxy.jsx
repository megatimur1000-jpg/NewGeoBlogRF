import React from 'react';

// Временная заглушка для AtomicGalaxy без 3D зависимостей
export default function AtomicGalaxy({ sections, onSelectGalaxy }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
      <div className="text-center p-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Атомная Галактика</h3>
        <p className="text-gray-600 mb-4">3D визуализация временно отключена</p>
        <div className="text-sm text-gray-500 space-y-1">
          <p>Секций: {sections?.length || 0}</p>
          <p>Активных: {sections?.filter(s => s.active).length || 0}</p>
        </div>
        {sections && sections.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {sections.slice(0, 4).map((section, index) => (
              <button
                key={section.id}
                onClick={() => onSelectGalaxy?.(section.id)}
                className={`p-2 rounded text-xs transition-colors ${
                  section.active 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                {section.title || `Секция ${index + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}