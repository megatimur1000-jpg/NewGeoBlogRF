import React, { useState, useCallback } from 'react';
import { X, MapPin, Search } from 'lucide-react';
import { geocodingService, Place } from '../../services/geocodingService';
import MiniEventMap from './MiniEventMap';
import './EventLocationModal.css';

interface EventLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    title: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  onConfirm: (location: {
    title: string;
    address: string;
    coordinates: { lat: number; lng: number };
  }) => void;
}

const EventLocationModal: React.FC<EventLocationModalProps> = ({
  isOpen,
  onClose,
  location,
  onConfirm,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    location.coordinates.lat && location.coordinates.lng
      ? [location.coordinates.lat, location.coordinates.lng]
      : null
  );
  const [currentAddress, setCurrentAddress] = useState(location.address);

  if (!isOpen) return null;

  // Обработка поиска
  const handleSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const places = await geocodingService.searchPlaces(query);
      setSearchResults(places);
      setShowResults(places.length > 0);
    } catch (error) {
      console.error('Ошибка поиска места:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Обработка выбора места из результатов
  const handlePlaceSelect = useCallback((place: Place) => {
    const [lat, lng] = place.coordinates;
    setMarkerPosition([lat, lng]);
    setSearchQuery(place.label);
    setCurrentAddress(place.label);
    setShowResults(false);
  }, []);

  // Обработка клика на карту
  const handleMapClick = useCallback(async (position: [number, number]) => {
    setMarkerPosition(position);
    
    // Обратный геокодинг
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&accept-language=ru&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Geoblog/1.0',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.display_name || `${position[0]}, ${position[1]}`;
        setCurrentAddress(address);
      } else {
        setCurrentAddress('');
      }
    } catch (error) {
      console.error('Ошибка обратного геокодинга:', error);
      setCurrentAddress('');
    }
  }, []);

  // Обработка изменения позиции маркера
  const handleMarkerPositionChange = useCallback((position: [number, number]) => {
    handleMapClick(position);
  }, [handleMapClick]);

  // Подтверждение выбора
  const handleConfirm = useCallback(() => {
    if (!markerPosition) return;
    
    onConfirm({
      title: location.title || 'Место проведения',
      address: currentAddress,
      coordinates: { lat: markerPosition[0], lng: markerPosition[1] },
    });
    onClose();
  }, [markerPosition, currentAddress, location.title, onConfirm, onClose]);

  return (
    <div className="event-location-modal-overlay" onClick={onClose}>
      <div className="event-location-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="event-location-modal-header">
          <h2 className="event-location-modal-title">
            <MapPin size={20} />
            Указать точнее на карте
          </h2>
          <button
            type="button"
            className="event-location-modal-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="event-location-modal-body">
          {/* Поле поиска */}
          <div className="location-search-container">
            <div className="location-search-input-wrapper">
              <Search size={18} className="location-search-icon" />
              <input
                type="text"
                className="location-search-input"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true);
                  }
                }}
                placeholder="Поиск места..."
              />
              {searchQuery && (
                <button
                  type="button"
                  className="location-search-clear"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {/* Результаты поиска */}
            {showResults && searchResults.length > 0 && (
              <div className="location-search-results">
                {isSearching && (
                  <div className="location-search-loading">Поиск...</div>
                )}
                {!isSearching && searchResults.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    className="location-search-result-item"
                    onClick={() => handlePlaceSelect(place)}
                  >
                    <MapPin size={14} />
                    <div className="location-search-result-content">
                      <div className="location-search-result-name">{place.name}</div>
                      <div className="location-search-result-label">{place.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Полноразмерная карта */}
          <div className="event-location-modal-map">
            <MiniEventMap
              height="500px"
              center={markerPosition || [55.7558, 37.6176]}
              zoom={markerPosition ? 15 : 10}
              markerPosition={markerPosition}
              onMarkerPositionChange={handleMarkerPositionChange}
              onMapClick={handleMapClick}
            />
          </div>

          {/* Текущий адрес */}
          {currentAddress && (
            <div className="event-location-modal-address">
              <MapPin size={16} />
              <span>{currentAddress}</span>
            </div>
          )}
        </div>

        <div className="event-location-modal-footer">
          <button
            type="button"
            className="event-location-modal-cancel"
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            type="button"
            className="event-location-modal-confirm"
            onClick={handleConfirm}
            disabled={!markerPosition}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventLocationModal;

