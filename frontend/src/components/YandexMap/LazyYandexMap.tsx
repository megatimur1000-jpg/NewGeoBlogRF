import React, { Suspense } from 'react';
const YandexMap = React.lazy(() => import('./YandexMap'));

interface LazyYandexMapProps {
  center: [number, number] | null;
  zoom: number;
  markers?: Array<{
    id: string; // Изменено с number на string для UUID
    coordinates: [number, number];
    title: string;
    description?: string;
  }>;
  onMapClick?: (coordinates: [number, number]) => void;
  onRemoveMarker?: (markerId: string) => void; // Добавляем пропс для удаления маркера
  routeLine?: [number, number][];
  displayedRoutePolylines?: Array<{id: string, polyline: [number, number][], color: string}>;
  onMapReady?: () => void;
  autoFitBounds?: boolean; // Новый пропс для автоматического масштабирования
  mapLayer?: string; // Новый проп для слоя карты
  zones?: Array<{ severity?: string; polygons: number[][][]; name?: string; type?: string }>;
}

const LazyYandexMap: React.FC<LazyYandexMapProps> = (props) => {
  // Простая проверка рендеринга - разрешаем null центр
  if (!props.zoom) {
    return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
      <div>Ошибка: отсутствует зум</div>
    </div>;
  }

  return (
    <Suspense fallback={<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Загрузка карты...</div>}>
      <YandexMap {...props} />
    </Suspense>
  );
};

export default LazyYandexMap; 