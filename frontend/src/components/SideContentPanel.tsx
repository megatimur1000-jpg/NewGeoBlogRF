import React from 'react';
import { useSideContent } from '../contexts/SideContentContext';

const SideContentPanel: React.FC = () => {
  const sideContentContext = useSideContent();

  // Если контекст не найден, показываем загрузку
  if (!sideContentContext) {
    return (
      <div className="side-content-panel">
        <div className="side-content-header">
          <h3 className="text-lg font-semibold text-gray-800">Загрузка...</h3>
        </div>
        <div className="side-content-body">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const { content, title } = sideContentContext;

  if (!content) {
    return null;
  }

  return (
    <div className="side-content-panel">
      <div className="side-content-header">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="side-content-body">
        {content}
      </div>
    </div>
  );
};

export default SideContentPanel; 