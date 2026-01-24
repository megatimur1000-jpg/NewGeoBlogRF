// Временная заглушка для MarkerPopup без useNavigate
import React from 'react';

interface MarkerPopupStubProps {
  marker: any;
  onClose: () => void;
  onHashtagClick?: (hashtag: string) => void;
  onMarkerUpdate: (updatedMarker: any) => void;
  onEdit?: (marker: any) => void;
  onReport?: (marker: any) => void;
  onRequestEdit?: (marker: any) => void;
  onAddToFavorites: (marker: any) => void;
  onAddToBlog?: (marker: any) => void;
  isFavorite: boolean;
  isSelected?: boolean;
}

const MarkerPopupStub: React.FC<MarkerPopupStubProps> = ({ 
  marker, 
  onClose, 
  onAddToFavorites, 
  isFavorite 
}) => {
  return (
    <div className="custom-marker-popup" style={{
      position: 'absolute',
      background: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 1000,
      minWidth: '200px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>{marker.title}</h3>
        <button 
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '18px', 
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
          {marker.description || 'Описание отсутствует'}
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onAddToFavorites(marker)}
          style={{
            background: isFavorite ? '#8e44ad' : '#f0f0f0',
            color: isFavorite ? 'white' : '#333',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          {isFavorite ? 'В избранном' : 'В избранное'}
        </button>
      </div>
    </div>
  );
};

export default MarkerPopupStub;
