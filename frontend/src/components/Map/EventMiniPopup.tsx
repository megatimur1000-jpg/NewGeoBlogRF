import React from 'react';
import { MockEvent } from '../TravelCalendar/mockEvents';
import { getCategoryById } from '../TravelCalendar/TravelCalendar';
import StarRating from '../ui/StarRating';
import './EventMiniPopup.css';

interface EventMiniPopupProps {
  event: MockEvent;
  onOpenFull: () => void;
  isSelected?: boolean;
  showGoButton?: boolean; // Показывать кнопку "Перейти" (только на map.tsx)
  showAddToRoute?: boolean; // Показывать кнопку "Добавить в маршрут" (только на planner.tsx)
  onAddToRoute?: () => void; // Обработчик добавления в маршрут
}

const EventMiniPopup: React.FC<EventMiniPopupProps> = ({ 
  event, 
  onOpenFull, 
  isSelected,
  showGoButton = false,
  showAddToRoute = false,
  onAddToRoute
}) => {
  const category = getCategoryById(event.categoryId);
  const Icon = category?.icon;
  
  // Преобразуем цвет из Tailwind класса в hex
  const colorMap: { [key: string]: string } = {
    'bg-red-500': '#ef4444',
    'bg-orange-500': '#f97316',
    'bg-sky-500': '#0ea5e9',
    'bg-emerald-500': '#10b981',
    'bg-violet-500': '#8b5cf6',
    'bg-amber-500': '#f59e0b',
    'bg-pink-500': '#ec4899',
    'bg-fuchsia-500': '#d946ef',
    'bg-indigo-500': '#6366f1',
    'bg-lime-500': '#84cc16',
    'bg-cyan-500': '#06b6d4',
    'bg-yellow-400': '#facc15',
    'bg-rose-500': '#f43f5e',
    'bg-purple-600': '#9333ea',
    'bg-orange-400': '#fb923c',
    'bg-teal-500': '#14b8a6',
    'bg-blue-400': '#60a5fa',
    'bg-neutral-800': '#262626'
  };
  const color = category?.color ? (colorMap[category.color] || '#6b7280') : '#6b7280';
  const categoryLabel = category?.name || 'Событие';

  // Простой рейтинг (пока используем фиксированный, можно добавить реальный рейтинг позже)
  const rating = 4.5; // TODO: Добавить реальный рейтинг из API

  return (
    <div className={`event-mini-popup-vertical${isSelected ? ' selected' : ''}`}>
      <div className="event-mini-popup-icon" style={{ background: color }}>
        {Icon && <Icon className="event-mini-popup-main-icon" />}
      </div>
      <div className="event-mini-popup-title">{event.title}</div>
      {category && (
        <div className="event-mini-popup-category" style={{ color: '#333', fontSize: '10px', fontWeight: '700' }}>
          {categoryLabel}
        </div>
      )}
      <div className="event-mini-stars">
        <StarRating value={rating} count={0} size={12} />
      </div>
      {showGoButton && (
        <button className="event-mini-popup-btn" onClick={onOpenFull}>
          Перейти
        </button>
      )}
      {showAddToRoute && onAddToRoute && (
        <button 
          className="event-mini-popup-btn event-mini-popup-btn-route" 
          onClick={onAddToRoute}
          title="Добавить событие в маршрут"
        >
          В маршрут
        </button>
      )}
    </div>
  );
};

export default EventMiniPopup;
