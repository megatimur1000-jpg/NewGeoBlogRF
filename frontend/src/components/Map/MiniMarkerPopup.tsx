// frontend/src/components/Map/MiniMarkerPopup.tsx
import React from 'react';
import { MarkerData } from '../../types/marker';
import { CATEGORIES } from '../../constants/categories';
import { getCategoryByKey, getCategoryColor, getFontAwesomeIconName } from '../../constants/markerCategories';
import StarRating from '../ui/StarRating';
import { getSummary as getRatingSummary } from '../../services/ratingsService';
import './MiniMarkerPopup.css';

interface MiniMarkerPopupProps {
  marker: MarkerData;
  onOpenFull: () => void;
  isSelected?: boolean; // Для glowing-рамки
}

const MiniMarkerPopup: React.FC<MiniMarkerPopupProps> = ({ marker, onOpenFull, isSelected }) => {
  // Используем централизованную систему категорий для единообразия
  const categoryInfo = marker.category ? getCategoryByKey(marker.category) : null;
  const categoryFromCategories = CATEGORIES.find(c => c.key === marker.category);
  const Icon = categoryFromCategories?.icon; // React компонент для отображения
  const color = categoryInfo?.color || categoryFromCategories?.color || '#888';
  const categoryLabel = categoryInfo?.label || categoryFromCategories?.label || 'Место';
  
  // Получаем FontAwesome имя для единообразия (для проверки)
  const faIconName = getFontAwesomeIconName(marker.category || 'other');

  const [avg, setAvg] = React.useState(Number(marker.rating) || 0);
  const [count, setCount] = React.useState(Number(marker.rating_count) || 0);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getRatingSummary('marker', marker.id);
        if (mounted) { setAvg(s.avg); setCount(s.count); }
      } catch {}
    })();
    return () => { mounted = false; };
  }, [marker.id]);

  // Определяем «маршрутные» буквы для старт/финиш (A/B)
  const lowerTitle = (marker.title || '').toLowerCase();
  let routeLetter: string | null = null;
  if (lowerTitle.includes('начало')) routeLetter = 'A';
  else if (lowerTitle.includes('конец')) routeLetter = 'B';

  return (
    <div className={`mini-marker-popup-vertical${isSelected ? ' selected' : ''}`}>
      <div className="mini-popup-icon" style={{ background: routeLetter ? '#ffffff' : color, border: routeLetter ? '2px solid #333' : undefined }}>
        {routeLetter
          ? (<span className="mini-popup-letter">{routeLetter}</span>)
          : (Icon && <Icon className="mini-popup-main-icon" />)}
      </div>
      <div className="mini-popup-title">{marker.title}</div>
      {categoryInfo && (
        <div className="mini-popup-category" style={{ color: '#333', fontSize: '10px', fontWeight: '700' }}>
          {categoryLabel}
        </div>
      )}
      <div className="mini-stars">
        <StarRating value={avg} count={count} size={12} />
      </div>
      <button className="mini-popup-btn" onClick={onOpenFull}>Подробнее</button>
    </div>
  );
};

export default MiniMarkerPopup;
