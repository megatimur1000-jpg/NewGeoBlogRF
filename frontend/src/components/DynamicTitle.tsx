import React from 'react';
import { useLocation } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';

const DynamicTitle: React.FC = () => {
  const location = useLocation();
  const leftContent = useContentStore((state) => state.leftContent);
  const rightContent = useContentStore((state) => state.rightContent);
  
  // Определяем заголовок на основе активного контента
  const getTitle = (): string => {
    if (leftContent === 'planner') return 'Планировщик маршрутов';
    if (leftContent === 'map') return 'Карта';
    if (leftContent === 'calendar') return 'Календарь событий';
    if (rightContent === 'posts') return 'Посты';
    if (rightContent === 'feed') return 'Лента активности';
    if (location.pathname.includes('/planner')) return 'Планировщик маршрутов';
    if (location.pathname.includes('/map')) return 'Карта';
    if (location.pathname.includes('/calendar')) return 'Календарь событий';
    if (location.pathname.includes('/posts') || location.pathname === '/') return 'Посты';
    return 'ГеоБлог.рф';
  };
  
  const title = getTitle();
  
  return (
    <div 
      className="dynamic-title"
      style={{
        position: 'absolute',
        top: '-40px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-panel)',
        padding: '8px 24px',
        fontSize: '16px',
        fontWeight: 500,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
        zIndex: 1001
      }}
    >
      {title}
    </div>
  );
};

export default DynamicTitle;

