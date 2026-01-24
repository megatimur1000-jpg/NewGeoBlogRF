import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MapPin } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { FavoritePlace } from '../../types/favorites';
import { getMarkerById } from '../../services/markerService';
import { MarkerData } from '../../types/marker';
import { PostMap } from '../Maps/PostMap';

interface MiniMapMarkerProps {
  markerId?: string;
  className?: string;
  height?: string;
  glBase?: 'opentopo' | 'alidade' | 'osm';
}

const MapContainer = styled.div<{ height?: string; $expanded?: boolean }>`
  width: 100%;
  height: ${props => {
    // Если попап открыт ($expanded), увеличиваем высоту на 1.5 см (≈57px)
    const baseHeight = props.height || '300px';
    if (props.$expanded) {
      const numericHeight = parseInt(baseHeight) || 300;
      return `${numericHeight + 57}px`;
    }
    return baseHeight;
  }};
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: height 0.3s ease-out;
`;

const MapHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%);
  padding: 12px 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MapTitle = styled.div`
  color: white;
  font-weight: 600;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MapActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  border-radius: 8px;
`;

const LoadingContent = styled.div`
  text-align: center;
  color: #6b7280;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  border-radius: 8px;
  border: 2px solid #fecaca;
`;

const ErrorContent = styled.div`
  text-align: center;
  color: #dc2626;
  padding: 20px;
`;

const MiniMapMarker: React.FC<MiniMapMarkerProps> = ({
  markerId,
  className,
  height = '300px',
  glBase = 'alidade'
}) => {
  const [markerData, setMarkerData] = useState<FavoritePlace | MarkerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStandardPopupOpen, setIsStandardPopupOpen] = useState(false);
  const favorites = useFavorites();
  const auth = useAuth();

  useEffect(() => {
    const loadMarkerData = async () => {
      if (!markerId) {
        setError('ID метки не указан');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1) Пытаемся найти в избранном (и для гостей тоже)
        if (favorites?.favoritePlaces && favorites.favoritePlaces.length > 0) {
          const favoriteMarker = favorites.favoritePlaces.find(place => place.id === markerId);
          if (favoriteMarker) {
            setMarkerData(favoriteMarker);
            setLoading(false);
            return;
          }
        }

        // 2) Если это гостевой черновик (draft:*), читаем из localStorage
        if (typeof markerId === 'string' && markerId.startsWith('draft:')) {
          try {
            const { listDrafts } = await import('../../services/guestDrafts');
            const drafts = listDrafts('marker');
            const draft = drafts.find((d: any) => `draft:${d.id}` === markerId);
            if (draft && draft.data) {
              const draftData = draft.data as any;
              const asMarker: MarkerData = {
                id: `draft:${draft.id}`,
                title: draftData.title || draftData.name || 'Без названия',
                description: draftData.description || '',
                latitude: Number(draftData.latitude),
                longitude: Number(draftData.longitude),
                category: draftData.category,
                rating: 0,
                rating_count: 0,
                photo_urls: Array.isArray(draftData.photoUrls) ? draftData.photoUrls : (draftData.photoUrls ? String(draftData.photoUrls).split(',') : []),
                likes_count: 0,
                comments_count: 0,
                shares_count: 0,
                author_name: 'Гость',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_draft: true
              } as any;
              setMarkerData(asMarker);
              setLoading(false);
              return;
            }
          } catch (e) {
            // ignore and fallback to API
          }
        }

        // 3) Загружаем из API
        const apiMarker = await getMarkerById(markerId);
        if (apiMarker) {
          setMarkerData(apiMarker);
        } else {
          setError('Метка не найдена');
        }
      } catch (err) {
        setError('Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    loadMarkerData();
  }, [markerId]); // Убираем favorites и auth из зависимостей

  // Убрали handleFullscreen и handleClose - полноэкранный режим не нужен

  if (loading) {
    return (
      <MapContainer height={height} className={className}>
        <LoadingOverlay>
          <LoadingContent>
            <LoadingSpinner />
            <div>Загрузка метки...</div>
          </LoadingContent>
        </LoadingOverlay>
      </MapContainer>
    );
  }

  if (error || !markerData) {
    return (
      <MapContainer height={height} className={className}>
        <ErrorOverlay>
          <ErrorContent>
            <MapPin size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              Ошибка загрузки
            </div>
            <div style={{ fontSize: '12px' }}>
              {error || 'Метка не найдена'}
            </div>
          </ErrorContent>
        </ErrorOverlay>
      </MapContainer>
    );
  }

  const getMarkerTitle = (data: FavoritePlace | MarkerData) => {
    return 'name' in data ? data.name : data.title;
  };

  // Проверяем валидность координат
  const lat = Number(markerData.latitude);
  const lon = Number(markerData.longitude);
  const isValidCoords = Number.isFinite(lat) && Number.isFinite(lon) && 
                        lat >= -90 && lat <= 90 && 
                        lon >= -180 && lon <= 180;

  if (!isValidCoords) {
    return (
      <MapContainer height={height} className={className}>
        <ErrorOverlay>
          <ErrorContent>
            <MapPin size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              Неверные координаты метки
            </div>
            <div style={{ fontSize: '12px' }}>
              lat: {markerData.latitude}, lon: {markerData.longitude}
            </div>
          </ErrorContent>
        </ErrorOverlay>
      </MapContainer>
    );
  }

  const mapData = {
    id: markerData.id,
    coordinates: [lon, lat] as [number, number],
    title: getMarkerTitle(markerData),
    description: markerData.description,
    type: 'marker'
  };

  const category = markerData.category || (markerData as any).type || (markerData as any).category || 'other';

  return (
    <>
      <MapContainer height={height} className={className} $expanded={isStandardPopupOpen}>
        <MapHeader>
          <MapTitle>
            <MapPin size={16} />
            {getMarkerTitle(markerData)}
          </MapTitle>
          {/* Убрали кнопку разворачивания - не нужна в постах */}
        </MapHeader>
        
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <PostMap
            anchors={[{ 
              id: String(mapData.id), 
              lat: lat, 
              lon: lon, 
              title: getMarkerTitle(markerData) || 'Без названия',
              category: category,
              description: markerData.description || undefined
            }]}
            center={[lat, lon] as any}
            zoom={13}
            glBase={glBase}
            onStandardPopupOpen={() => {
              setIsStandardPopupOpen(true);
            }}
            onStandardPopupClose={() => {
              setIsStandardPopupOpen(false);
            }}
          />
        </div>
      </MapContainer>
    </>
  );
};

export default MiniMapMarker;