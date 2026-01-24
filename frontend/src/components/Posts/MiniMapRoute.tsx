import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Navigation, X, Maximize2 } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { FavoriteRoute } from '../../types/favorites';
import { getRouteById, RouteData } from '../../services/routeService';
import { PostMap } from '../Maps/PostMap';

interface MiniMapRouteProps {
  routeId?: string;
  className?: string;
  height?: string;
  glBase?: 'opentopo' | 'alidade' | 'osm';
}

const MapContainer = styled.div<{ height?: string }>`
  width: 100%;
  height: ${props => props.height || '300px'};
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  border-top: 3px solid #ef4444;
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

const MiniMapRoute: React.FC<MiniMapRouteProps> = ({
  routeId,
  className,
  height = '300px',
  glBase = 'alidade'
}) => {
  const [routeData, setRouteData] = useState<FavoriteRoute | RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const favorites = useFavorites();
  const auth = useAuth();

  useEffect(() => {
    const loadRouteData = async () => {
      if (!routeId) {
        setError('ID маршрута не указан');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Сначала ищем в избранном (для зарегистрированных пользователей)
        if (auth?.user && favorites?.favoriteRoutes) {
          const favoriteRoute = favorites.favoriteRoutes.find(
            route => route.id === routeId
          );

          if (favoriteRoute) {
            setRouteData(favoriteRoute);
            setLoading(false);
            return;
          }
        }

        // Загружаем из API (для гостей и если не найдено в избранном)
        console.log('🔍 MiniMapRoute: Загружаем маршрут из API, ID:', routeId);
        const apiRoute = await getRouteById(routeId);
        console.log('🔍 MiniMapRoute: Ответ API:', apiRoute);
        if (apiRoute) {
          setRouteData(apiRoute);
          setLoading(false);
          return;
        }

        setError('Маршрут не найден');
        setLoading(false);
      } catch (err) {
        console.error('Ошибка загрузки маршрута:', err);
        setError('Ошибка загрузки маршрута');
        setLoading(false);
      }
    };

    loadRouteData();
  }, [routeId]); // Убираем favorites из зависимостей

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleClose = () => {
    setIsFullscreen(false);
  };

  if (loading) {
    return (
      <MapContainer height={height} className={className}>
        <LoadingOverlay>
          <LoadingContent>
            <LoadingSpinner />
            <div>Загрузка маршрута...</div>
          </LoadingContent>
        </LoadingOverlay>
      </MapContainer>
    );
  }

  if (error || !routeData) {
    return (
      <MapContainer height={height} className={className}>
        <ErrorOverlay>
          <ErrorContent>
            <Navigation size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              Ошибка загрузки
            </div>
            <div style={{ fontSize: '12px' }}>
              {error || 'Маршрут не найден'}
            </div>
          </ErrorContent>
        </ErrorOverlay>
      </MapContainer>
    );
  }

  const getRouteCoordinates = (data: FavoriteRoute | RouteData) => {
    if ('waypoints' in data) {
      // FavoriteRoute
      return data.waypoints?.map((wp: any) => [wp.longitude, wp.latitude] as [number, number]) || [];
    } else {
      // Route (RouteData теперь это алиас для Route)
      const routeData = data as RouteData;
      return routeData.points?.map((point: any) => [point.longitude, point.latitude] as [number, number]) || [];
    }
  };

  // Преобразуем данные маршрута в формат PostMap (facade): [lat, lng]
  const coordinatesLngLat = getRouteCoordinates(routeData);
  const coordinatesLatLng: [number, number][] = coordinatesLngLat
    .map(([lng, lat]) => [lat, lng]);

  return (
    <>
      <MapContainer height={height} className={className}>
        <MapHeader>
          <MapTitle>
            <Navigation size={16} />
            {routeData.title}
          </MapTitle>
          <MapActions>
            <ActionButton onClick={handleFullscreen} title="Полный экран">
              <Maximize2 size={14} />
            </ActionButton>
          </MapActions>
        </MapHeader>
        
        <PostMap
          route={{ id: routeData.id, route_data: { geometry: coordinatesLatLng }, points: coordinatesLatLng }}
          zoom={12}
          glBase={glBase}
        />
      </MapContainer>

      {/* Полноэкранный режим */}
      {isFullscreen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={handleClose}
        >
          <div
            style={{
              width: '90%',
              height: '90%',
              maxWidth: '1200px',
              maxHeight: '800px',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <MapContainer height="100%">
              <MapHeader>
                <MapTitle>
                  <Navigation size={16} />
                  {routeData.title}
                </MapTitle>
                <MapActions>
                  <ActionButton onClick={handleClose} title="Закрыть">
                    <X size={14} />
                  </ActionButton>
                </MapActions>
              </MapHeader>
              
              <PostMap
                route={{ id: routeData.id, route_data: { geometry: coordinatesLatLng }, points: coordinatesLatLng }}
                zoom={12}
                glBase={glBase}
              />
            </MapContainer>
          </div>
        </div>
      )}
    </>
  );
};

export default MiniMapRoute;