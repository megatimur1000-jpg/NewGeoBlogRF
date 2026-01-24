import React from 'react';
import styled from 'styled-components';
import { GlassPanel, GlassHeader } from '../Glass';

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
`;

const IconCircle = styled.span<{ bg: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.bg};
  color: #fff;
  font-size: 0.8em;
  flex-shrink: 0;
`;

interface MapLegendProps {
  onClose: () => void;
  mapSettings?: {
    mapType: string;
    showTraffic: boolean;
    showBikeLanes: boolean;
    showHints: boolean;
    themeColor: string;
  };
}

const MapLegend: React.FC<MapLegendProps> = ({ onClose, mapSettings }) => (
  <GlassPanel
    isOpen={true}
    onClose={onClose}
    position="left"
    width="300px"
    closeOnOverlayClick={true}
    showCloseButton={false}
    className="map-legend-panel"
  >
    <GlassHeader
      title="Легенда карты"
      onClose={onClose}
      showCloseButton={true}
    />
    <div style={{ padding: '0 24px 24px 24px' }}>
    
    {/* Основные категории согласно constants/categories.ts */}
    <LegendRow>
      <IconCircle bg="#3498db"><i className="fas fa-star"></i></IconCircle>
      <span>Достопримечательность</span>
    </LegendRow>
    <LegendRow>
      <IconCircle bg="#e74c3c"><i className="fas fa-utensils"></i></IconCircle>
      <span>Ресторан</span>
    </LegendRow>
    <LegendRow>
      <IconCircle bg="#8e44ad"><i className="fas fa-bed"></i></IconCircle>
      <span>Отель</span>
    </LegendRow>
    <LegendRow>
      <IconCircle bg="#27ae60"><i className="fas fa-leaf"></i></IconCircle>
      <span>Природа</span>
    </LegendRow>
    <LegendRow>
      <IconCircle bg="#f1c40f"><i className="fas fa-landmark"></i></IconCircle>
      <span>Культура</span>
    </LegendRow>
    <LegendRow>
      <IconCircle bg="#f39c12"><i className="fas fa-gem"></i></IconCircle>
      <span>Развлечения</span>
    </LegendRow>
    <LegendRow>
      <IconCircle bg="#16a085"><i className="fas fa-bus"></i></IconCircle>
      <span>Транспорт</span>
    </LegendRow>
    <LegendRow>
      <IconCircle bg="#e67e22"><i className="fas fa-wallet"></i></IconCircle>
      <span>Торговля</span>
    </LegendRow>
    <LegendRow>
      <IconCircle bg="#e74c3c"><i className="fas fa-heart"></i></IconCircle>
      <span>Здравоохранение</span>
    </LegendRow>
    <LegendRow>
      <IconCircle bg="#3498db"><i className="fas fa-users"></i></IconCircle>
      <span>Образование</span>
    </LegendRow>
    <LegendRow>
      <IconCircle bg="#34495e"><i className="fas fa-question"></i></IconCircle>
      <span>Сервис</span>
    </LegendRow>
    <LegendRow>
      <IconCircle bg="#7f8c8d"><i className="fas fa-question"></i></IconCircle>
      <span>Другое</span>
    </LegendRow>
    <LegendRow>
      <IconCircle bg="#e67e22"><i className="fas fa-map-pin"></i></IconCircle>
      <span>Пользовательская метка</span>
    </LegendRow>
    <LegendRow>
      <span className="marker-cluster" style={{background:'#3498db',width:32,height:32,display:'inline-flex',alignItems:'center',justifyContent:'center'}}>5</span>
      <span>Кластер меток (количество)</span>
    </LegendRow>
    <LegendRow>
      <span style={{display:'inline-block',width:32,height:32,borderRadius:'50%',background:'#fff',border:'2px solid #e67e22',boxShadow:'0 0 8px orange',marginRight:8}}></span>
      <span>"Горячая" метка</span>
    </LegendRow>
    
    {/* Новые элементы для пробок и велодорожек */}
    {mapSettings?.showTraffic && (
      <LegendRow>
        <IconCircle bg="#ff6b6b"><i className="fas fa-car"></i></IconCircle>
        <span>Пробки</span>
      </LegendRow>
    )}
    
    {mapSettings?.showBikeLanes && (
      <LegendRow>
        <IconCircle bg="#4ecdc4"><i className="fas fa-bicycle"></i></IconCircle>
        <span>Велосипедные дорожки</span>
      </LegendRow>
    )}
    
    <div style={{marginTop: 12, padding: 8, background: '#f8f9fa', borderRadius: 6, fontSize: '0.85em'}}>
      <p style={{margin: 0, color: '#666'}}>
        💡 <strong>Совет:</strong> Пробки и велодорожки отображаются как дополнительные слои поверх основной карты.
      </p>
    </div>
    </div>
  </GlassPanel>
);

export default MapLegend;

export const markerCategoryStyles: {
  [key: string]: { color: string; icon: string; user?: boolean }
} = {
  attraction: { color: '#3498db', icon: 'fa-star' },
  restaurant: { color: '#e74c3c', icon: 'fa-utensils' },
  hotel: { color: '#8e44ad', icon: 'fa-bed' },
  nature: { color: '#27ae60', icon: 'fa-leaf' },
  culture: { color: '#f1c40f', icon: 'fa-landmark' },
  entertainment: { color: '#f39c12', icon: 'fa-gem' },
  transport: { color: '#16a085', icon: 'fa-bus' },
  shopping: { color: '#e67e22', icon: 'fa-wallet' },
  healthcare: { color: '#e74c3c', icon: 'fa-heart' },
  education: { color: '#3498db', icon: 'fa-users' },
  service: { color: '#34495e', icon: 'fa-building' },
  other: { color: '#7f8c8d', icon: 'fa-question' },
  user_poi: { color: '#e67e22', icon: 'fa-map-pin', user: true },
  default: { color: '#888', icon: 'fa-map-marker-alt' }
};
