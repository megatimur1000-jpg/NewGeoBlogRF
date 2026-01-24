import React from 'react';
import styled from 'styled-components';
import { Heart, MessageCircle, Share, X, MapPin, Navigation, Calendar, Map, Mountain, Home, Landmark, Lightbulb } from 'lucide-react';
import { PostDTO } from '../../types/post';
import { useFavorites } from '../../contexts/FavoritesContext';
import { PostMap } from '../Maps/PostMap';
import { isGuidePost, parseGuideData } from '../../utils/postUtils';

interface InteractivePostViewProps {
  post: PostDTO;
  onClose: () => void;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onReaction?: (postId: string, emoji: string) => void;
}

const PostOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
`;

const PostContainer = styled.div<{ isGuide?: boolean }>`
  width: 100%;
  max-width: ${props => props.isGuide ? '1200px' : '1200px'};
  background: white;
  border-radius: ${props => props.isGuide ? '20px' : '12px'};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 20px auto;
`;

// Стили для путеводителя
const GuideHeader = styled.div`
  background: linear-gradient(135deg, #4a6fa5 0%, #6b8cae 100%);
  color: white;
  padding: 40px;
  text-align: center;
`;

const GuideTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const GuideMeta = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  opacity: 0.9;
  font-size: 1.1rem;
  margin-top: 15px;
  
  span {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const GuideIntroduction = styled.div`
  padding: 40px;
  background: #f8f9fa;
  border-bottom: 2px solid #6b8cae;
`;

const GuideIntroductionText = styled.p`
  font-size: 1.1rem;
  line-height: 1.8;
  color: #4a4a4a;
  text-align: justify;
  white-space: pre-wrap;
`;

const TocContainer = styled.div`
  background: #f8f9fa;
  padding: 30px 40px;
  border-bottom: 2px solid #6b8cae;
`;

const TocTitle = styled.h2`
  font-size: 1.8rem;
  color: #4a6fa5;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TocList = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TocItem = styled.li`
  padding: 15px;
  background: white;
  border-radius: 12px;
  border-left: 4px solid #e74c3c;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    transform: translateX(5px);
    border-left-color: #4a6fa5;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  svg {
    color: #e74c3c;
    margin-right: 10px;
    width: 1.2rem;
    height: 1.2rem;
    flex-shrink: 0;
  }
`;

const getSectionIcon = (title: string, idx: number): React.ReactNode => {
  const lower = title.toLowerCase();
  if (lower.includes('карт') || lower.includes('маршрут')) return <Map size={20} />;
  if (lower.includes('гор') || lower.includes('нагор')) return <Mountain size={20} />;
  if (lower.includes('озер') || lower.includes('вод')) return <Navigation size={20} />;
  if (lower.includes('дерев') || lower.includes('дом')) return <Home size={20} />;
  if (lower.includes('культур') || lower.includes('наследи')) return <Landmark size={20} />;
  if (lower.includes('совет') || lower.includes('полезн')) return <Lightbulb size={20} />;
  return <MapPin size={20} />;
};

const SectionContainer = styled.div`
  padding: 40px;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: #4a6fa5;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionContent = styled.p`
  font-size: 1.1rem;
  line-height: 1.8;
  color: #4a4a4a;
  margin-bottom: 25px;
  text-align: justify;
  white-space: pre-wrap;
`;

const SectionMap = styled.div`
  margin-top: 25px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  height: 500px;
`;

// Стили для обычного поста
const SimplePostHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9fafb;
`;

const SimplePostTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const SimplePostContent = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

const InteractivePanel = styled.div<{ $expanded?: boolean }>`
  width: ${p => (p.$expanded ? '100%' : '50%')};
  padding: 20px;
  border-right: 1px solid #e5e7eb;
  background: #fafafa;
  display: flex;
  flex-direction: column;
`;

const ContentPanel = styled.div<{ $hidden?: boolean }>`
  width: 50%;
  ${p => p.$hidden ? 'display:none;' : ''}
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const PostText = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 20px;
  white-space: pre-wrap;
`;

const PostFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  
  ${props => props.variant === 'primary' ? `
    background: #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
    }
  ` : `
    background: #f3f4f6;
    color: #374151;
    
    &:hover {
      background: #e5e7eb;
    }
  `}
`;

const InteractivePostView: React.FC<InteractivePostViewProps> = ({
  post,
  onClose,
  onLike,
  onComment,
  onShare
}) => {
  const favorites = useFavorites();
  const [expanded, setExpanded] = React.useState(false);
  const guidePost = isGuidePost(post);
  const guideData = guidePost ? parseGuideData(post) : null;

  // Определяем тип интерактивного контента
  const getInteractiveContent = () => {
    if (post.attached_snapshot) {
      const snap = post.attached_snapshot;
      const anchors = (snap.markers || []).map(m => {
        let lat = Number.isFinite((m as any).latitude) ? Number((m as any).latitude) : null;
        let lon = Number.isFinite((m as any).longitude) ? Number((m as any).longitude) : null;
        
        if (lat === null || lon === null) {
          if (Array.isArray(m.coordinates) && m.coordinates.length >= 2) {
            lat = lat === null ? Number(m.coordinates[0]) : lat;
            lon = lon === null ? Number(m.coordinates[1]) : lon;
          } else {
            lat = lat === null ? (Number.isFinite((m as any).lat) ? Number((m as any).lat) : null) : lat;
            lon = lon === null ? (Number.isFinite((m as any).lon) ? Number((m as any).lon) : null) : lon;
          }
        }
        
        if (Number.isFinite(lat) && Number.isFinite(lon) && lat !== null && lon !== null) {
          const latOk = lat >= -90 && lat <= 90;
          const lonOk = lon >= -180 && lon <= 180;
          if (!latOk && lonOk && lon >= -90 && lon <= 90) {
            [lat, lon] = [lon, lat];
          }
        }
        
        const finalLat = Number.isFinite(lat) && lat !== null ? lat : 0;
        const finalLon = Number.isFinite(lon) && lon !== null ? lon : 0;
        
        return { 
          id: m.id, 
          lat: finalLat, 
          lon: finalLon, 
          title: m.title || (m as any).name || '',
          category: (m as any).category || (m as any).type || undefined,
          description: (m as any).description || undefined
        };
      })
      .filter(anchor => anchor.lat !== 0 || anchor.lon !== 0);
      const route = (snap.routes && snap.routes[0]) ? { id: snap.routes[0].id, route_data: { geometry: snap.routes[0].coordinates } } : undefined as any;
      return (
        <div style={{ height: '100%' }}>
          <PostMap
            route={route}
            anchors={anchors}
            center={snap.center}
            zoom={snap.zoom}
          />
        </div>
      );
    }

    if (post.route_id) {
      const r = (favorites?.favoriteRoutes || []).find(r => r.id === post.route_id);
      if (!r) {
        return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Маршрут не найден
        </div>;
      }
      
      const savedGeometry = Array.isArray((r as any)?.route_data?.geometry) 
        ? (r as any).route_data.geometry 
        : undefined;
      
      const fallbackPoints = Array.isArray((r as any)?.points) 
        ? (r as any).points 
        : (Array.isArray(r?.waypoints) 
            ? r!.waypoints!.map(w => [w.latitude, w.longitude]) 
            : []);
      
      const routeGeometry = savedGeometry || fallbackPoints;
      const center = Array.isArray(routeGeometry) && routeGeometry.length 
        ? routeGeometry[Math.floor(routeGeometry.length / 2)] 
        : undefined;
      
      return (
        <div style={{ height: '100%' }}>
          <PostMap
            route={{ 
              id: post.route_id, 
              route_data: {
                geometry: savedGeometry || routeGeometry,
                points: fallbackPoints
              },
              points: routeGeometry
            }}
            anchors={(r?.waypoints || []).map(w => ({ 
              id: w.id, 
              lat: w.latitude, 
              lon: w.longitude, 
              title: w.name,
              category: (w as any).category || (w as any).type || undefined,
              description: (w as any).description || undefined
            }))}
            center={center as any}
            zoom={12}
          />
        </div>
      );
    }
    
    if (post.marker_id) {
      const m = (favorites?.favoritePlaces || []).find(p => p.id === post.marker_id);
      const lat = m?.latitude ?? m?.coordinates?.[1];
      const lon = m?.longitude ?? m?.coordinates?.[0];
      if (typeof lat === 'number' && typeof lon === 'number') {
      return (
          <div style={{ height: '100%' }}>
            <PostMap
              anchors={[{ 
                id: m!.id, 
                lat, 
                lon, 
                title: m!.name,
                category: (m as any).category || (m as any).type || undefined,
                description: (m as any).description || (m as any).location || undefined
              }]}
              center={[lat, lon]}
              zoom={13}
        />
          </div>
      );
      }
    }
    
    if (post.event_id) {
      const e = (favorites?.favoriteEvents || []).find(ev => ev.id === post.event_id);
      if (e) {
        const lat = e.latitude;
        const lon = e.longitude;
        if (typeof lat === 'number' && typeof lon === 'number') {
      return (
            <div style={{ height: '100%' }}>
              <PostMap
                anchors={[{ 
                  id: e.id, 
                  lat, 
                  lon, 
                  title: e.title,
                  category: 'event',
                  description: e.description || e.location || undefined
                }]}
                center={[lat, lon]}
                zoom={13}
              />
            </div>
      );
    }
      }
    }
    
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6',
        borderRadius: '8px',
        color: '#9ca3af',
        fontSize: '16px',
        fontWeight: '500'
      }}>
        Нет интерактивного контента
      </div>
    );
  };

  const renderSectionMap = (section: any) => {
    let markerData = null;
    let routeData = null;
    let eventData = null;
    
    if (section.markerId) {
      markerData = favorites?.favoritePlaces?.find(p => p.id === section.markerId);
    }
    if (section.routeId) {
      routeData = favorites?.favoriteRoutes?.find(r => r.id === section.routeId);
    }
    if (section.eventId) {
      eventData = favorites?.favoriteEvents?.find(e => e.id === section.eventId);
    }
    
    if (!markerData && !routeData && !eventData) return null;
    
    const anchors = markerData ? [{
      id: markerData.id,
      lat: markerData.latitude,
      lon: markerData.longitude,
      title: markerData.name || '',
      category: (markerData as any).category || (markerData as any).type
    }] : eventData ? [{
      id: eventData.id,
      lat: eventData.latitude,
      lon: eventData.longitude,
      title: eventData.title || '',
      category: 'event'
    }] : [];
    
    const route = routeData ? {
      id: routeData.id,
      route_data: {
        geometry: (routeData as any).route_data?.geometry || 
          (Array.isArray((routeData as any).coordinates) ? (routeData as any).coordinates : []),
        points: Array.isArray((routeData as any).coordinates) ? (routeData as any).coordinates : []
      }
    } : undefined;
    
    return (
      <SectionMap>
        <PostMap
          anchors={anchors}
          route={route}
          zoom={12}
        />
      </SectionMap>
    );
  };

  // Рендер путеводителя
  if (guidePost && guideData) {
    return (
      <PostOverlay onClick={onClose}>
        <PostContainer isGuide onClick={(e) => e.stopPropagation()}>
          <GuideHeader>
            <GuideTitle>{post.title || 'Путеводитель'}</GuideTitle>
            <GuideMeta>
              <span>
                👤 {post.author_name || 'ГеоБлог.рф'}
              </span>
              <span>
                📅 {new Date(post.created_at).toLocaleDateString('ru-RU')}
              </span>
            </GuideMeta>
          </GuideHeader>
          
          {guideData.introduction && (
            <GuideIntroduction>
              <GuideIntroductionText>{guideData.introduction}</GuideIntroductionText>
            </GuideIntroduction>
          )}
          
          {guideData.sections.length > 0 && (
            <TocContainer>
              <TocTitle>📑 Оглавление</TocTitle>
              <TocList>
                {guideData.sections.map((section: any, idx: number) => (
                  <TocItem key={idx} onClick={() => {
                    const element = document.getElementById(`section-${idx}`);
                    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}>
                    {getSectionIcon(section.title, idx)}
                    {section.title || `Секция ${idx + 1}`}
                  </TocItem>
                ))}
              </TocList>
            </TocContainer>
          )}
          
          {guideData.sections.map((section: any, idx: number) => (
            <SectionContainer key={idx} id={`section-${idx}`}>
              <SectionTitle>
                {section.title || `Секция ${idx + 1}`}
              </SectionTitle>
              {section.content && (
                <SectionContent>{section.content}</SectionContent>
              )}
              {section.hasMap && renderSectionMap(section)}
            </SectionContainer>
          ))}
          
          <PostFooter>
            <ActionButton variant="primary" onClick={() => onLike?.(post.id)}>
              <Heart size={16} />
              Лайк
            </ActionButton>
            <ActionButton onClick={() => onComment?.(post.id)}>
              <MessageCircle size={16} />
              Обсудить
            </ActionButton>
            <ActionButton onClick={() => onShare?.(post.id)}>
              <Share size={16} />
              Поделиться
            </ActionButton>
            <ActionButton onClick={onClose} style={{ marginLeft: 'auto' }}>
              <X size={16} />
              Закрыть
            </ActionButton>
          </PostFooter>
        </PostContainer>
      </PostOverlay>
    );
  }

  // Рендер обычного поста
  return (
    <PostOverlay onClick={onClose}>
      <PostContainer onClick={(e) => e.stopPropagation()}>
        <SimplePostHeader>
          <SimplePostTitle>
            {post.title || 'Пост без заголовка'}
          </SimplePostTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </SimplePostHeader>

        <SimplePostContent>
          <InteractivePanel $expanded={expanded}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button
                onClick={() => setExpanded(v => !v)}
                className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                title={expanded ? 'Свернуть' : 'Развернуть карту'}
              >
                {expanded ? 'Свернуть' : 'Развернуть'}
              </button>
            </div>
            {getInteractiveContent()}
          </InteractivePanel>

          <ContentPanel $hidden={expanded}>
            <PostText>
              {post.body}
            </PostText>
          </ContentPanel>
        </SimplePostContent>

        <PostFooter>
          <ActionButton variant="primary" onClick={() => onLike?.(post.id)}>
            <Heart size={16} />
            Лайк
          </ActionButton>
          <ActionButton onClick={() => onComment?.(post.id)}>
            <MessageCircle size={16} />
            Обсудить
          </ActionButton>
          <ActionButton onClick={() => onShare?.(post.id)}>
            <Share size={16} />
            Поделиться
          </ActionButton>
        </PostFooter>
      </PostContainer>
    </PostOverlay>
  );
};

export default InteractivePostView;
