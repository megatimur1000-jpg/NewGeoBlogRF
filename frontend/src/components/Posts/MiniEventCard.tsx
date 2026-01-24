import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Calendar, X, Maximize2, MapPin, Clock, Users } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { FavoriteEvent } from '../../types/favorites';

interface MiniEventCardProps {
  eventId?: string;
  className?: string;
  height?: string;
}

const EventContainer = styled.div<{ height?: string }>`
  width: 100%;
  height: ${props => props.height || '300px'};
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const EventHeader = styled.div`
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;

const EventTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const EventActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
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

const EventContent = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

const EventInfo = styled.div`
  width: 50%;
  padding: 16px;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
`;

const EventMap = styled.div`
  width: 50%;
  border-left: 1px solid #e9ecef;
  position: relative;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
`;

const InfoLabel = styled.div`
  font-weight: 500;
  color: #374151;
  min-width: 60px;
`;

const InfoValue = styled.div`
  flex: 1;
  min-width: 0;
`;

const EventDescription = styled.div`
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  margin-top: 8px;
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
  border-top: 3px solid #8b5cf6;
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

const MiniEventCard: React.FC<MiniEventCardProps> = ({
  eventId,
  className,
  height = '300px'
}) => {
  const [eventData, setEventData] = useState<FavoriteEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const favorites = useFavorites();

  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) {
        setError('ID события не указан');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Сначала ищем в избранном
        const favoriteEvent = favorites?.favoriteEvents?.find(
          event => event.id === eventId
        );

        if (favoriteEvent) {
          setEventData(favoriteEvent);
          setLoading(false);
          return;
        }

        // Если не найдено в избранном, можно добавить загрузку из API
        setError('Событие не найдено');
        setLoading(false);
      } catch (err) {
        console.error('Ошибка загрузки события:', err);
        setError('Ошибка загрузки события');
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId, favorites]);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleClose = () => {
    setIsFullscreen(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  if (loading) {
    return (
      <EventContainer height={height} className={className}>
        <LoadingOverlay>
          <LoadingContent>
            <LoadingSpinner />
            <div>Загрузка события...</div>
          </LoadingContent>
        </LoadingOverlay>
      </EventContainer>
    );
  }

  if (error || !eventData) {
    return (
      <EventContainer height={height} className={className}>
        <ErrorOverlay>
          <ErrorContent>
            <Calendar size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              Ошибка загрузки
            </div>
            <div style={{ fontSize: '12px' }}>
              {error || 'Событие не найдено'}
            </div>
          </ErrorContent>
        </ErrorOverlay>
      </EventContainer>
    );
  }

  const mapEventData = {
    id: eventData.id,
    coordinates: [eventData.longitude, eventData.latitude] as [number, number],
    title: eventData.title,
    description: eventData.description,
    date: eventData.date,
    location: eventData.location
  };

  return (
    <>
      <EventContainer height={height} className={className}>
        <EventHeader>
          <EventTitle>
            <Calendar size={16} />
            {eventData.title}
          </EventTitle>
          <EventActions>
            <ActionButton onClick={handleFullscreen} title="Полный экран">
              <Maximize2 size={14} />
            </ActionButton>
          </EventActions>
        </EventHeader>

        <EventContent>
          <EventInfo>
            <InfoItem>
              <InfoLabel>📅 Дата:</InfoLabel>
              <InfoValue>{formatDate(eventData.date)}</InfoValue>
            </InfoItem>

            {eventData.time && (
              <InfoItem>
                <InfoLabel>🕐 Время:</InfoLabel>
                <InfoValue>{formatTime(eventData.time)}</InfoValue>
              </InfoItem>
            )}

            {eventData.location && (
              <InfoItem>
                <InfoLabel>📍 Место:</InfoLabel>
                <InfoValue>{eventData.location}</InfoValue>
              </InfoItem>
            )}

            {eventData.participants && (
              <InfoItem>
                <InfoLabel>👥 Участники:</InfoLabel>
                <InfoValue>{eventData.participants}</InfoValue>
              </InfoItem>
            )}

            {eventData.description && (
              <EventDescription>
                {eventData.description}
              </EventDescription>
            )}
          </EventInfo>

          <EventMap>
            {/* Статический preview вместо интерактивной карты */}
            <EventMapPlaceholder lat={eventData.latitude} lon={eventData.longitude} />
          </EventMap>
        </EventContent>
      </EventContainer>

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
            <EventContainer height="100%">
              <EventHeader>
                <EventTitle>
                  <Calendar size={16} />
                  {eventData.title}
                </EventTitle>
                <EventActions>
                  <ActionButton onClick={handleClose} title="Закрыть">
                    <X size={14} />
                  </ActionButton>
                </EventActions>
              </EventHeader>

              <EventContent>
                <EventInfo>
                  <InfoItem>
                    <InfoLabel>📅 Дата:</InfoLabel>
                    <InfoValue>{formatDate(eventData.date)}</InfoValue>
                  </InfoItem>

                  {eventData.time && (
                    <InfoItem>
                      <InfoLabel>🕐 Время:</InfoLabel>
                      <InfoValue>{formatTime(eventData.time)}</InfoValue>
                    </InfoItem>
                  )}

                  {eventData.location && (
                    <InfoItem>
                      <InfoLabel>📍 Место:</InfoLabel>
                      <InfoValue>{eventData.location}</InfoValue>
                    </InfoItem>
                  )}

                  {eventData.participants && (
                    <InfoItem>
                      <InfoLabel>👥 Участники:</InfoLabel>
                      <InfoValue>{eventData.participants}</InfoValue>
                    </InfoItem>
                  )}

                  {eventData.description && (
                    <EventDescription>
                      {eventData.description}
                    </EventDescription>
                  )}
                </EventInfo>

                <EventMap>
                  {/* Статический preview вместо интерактивной карты */}
                  <EventMapPlaceholder lat={eventData.latitude} lon={eventData.longitude} />
                </EventMap>
              </EventContent>
            </EventContainer>
          </div>
        </div>
      )}
    </>
  );
};

export default MiniEventCard;

// Компонент-заменитель для отображения местоположения события
const EventMapPlaceholder: React.FC<{ lat?: number; lon?: number }> = ({ lat, lon }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '12px',
      textAlign: 'center',
      padding: '12px',
      gap: '8px',
    }}
  >
    <div style={{ fontSize: '28px' }}>📍</div>
    <div>Местоположение события</div>
    {lat && lon && <small>{lat.toFixed(3)}°, {lon.toFixed(3)}°</small>}
  </div>
);