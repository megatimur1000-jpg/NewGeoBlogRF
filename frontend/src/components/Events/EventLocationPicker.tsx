import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { geocodingService, Place } from '../../services/geocodingService';
import MiniEventMap from './MiniEventMap';
import './EventLocationPicker.css';

interface EventLocationPickerProps {
  location: {
    title: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  onLocationChange: (location: {
    title: string;
    address: string;
    coordinates: { lat: number; lng: number };
  }) => void;
  onPreciseClick?: () => void;
}

const EventLocationPicker: React.FC<EventLocationPickerProps> = ({
  location,
  onLocationChange,
  onPreciseClick,
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

  // Обработка поиска с задержкой
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const places = await geocodingService.searchPlaces(searchQuery);
        setSearchResults(places);
        setShowResults(places.length > 0);
      } catch (error) {
        console.error('Ошибка поиска места:', error);
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Обработка выбора места из результатов поиска
  const handlePlaceSelect = useCallback((place: Place) => {
    const [lat, lng] = place.coordinates;
    setMarkerPosition([lat, lng]);
    setSearchQuery(place.label);
    setShowResults(false);
    
    onLocationChange({
      title: place.name,
      address: place.label,
      coordinates: { lat, lng },
    });
  }, [onLocationChange]);

  // Обработка клика на карту
  const handleMapClick = useCallback(async (position: [number, number]) => {
    setMarkerPosition(position);
    
    // Попытка обратного геокодинга через Nominatim
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
        
        onLocationChange({
          title: location.title || data.address?.name || 'Место проведения',
          address,
          coordinates: { lat: position[0], lng: position[1] },
        });
        
        setSearchQuery(address);
      } else {
        // Если геокодинг не удался, просто обновляем координаты
        onLocationChange({
          title: location.title || 'Место проведения',
          address: '',
          coordinates: { lat: position[0], lng: position[1] },
        });
      }
    } catch (error) {
      console.error('Ошибка обратного геокодинга:', error);
      onLocationChange({
        title: location.title || 'Место проведения',
        address: '',
        coordinates: { lat: position[0], lng: position[1] },
      });
    }
  }, [location.title, onLocationChange]);

  // Обработка изменения позиции маркера (при перетаскивании)
  const handleMarkerPositionChange = useCallback((position: [number, number]) => {
    handleMapClick(position);
  }, [handleMapClick]);

  // Синхронизация с внешним состоянием
  useEffect(() => {
    if (location.coordinates.lat && location.coordinates.lng) {
      const newPosition: [number, number] = [location.coordinates.lat, location.coordinates.lng];
      if (!markerPosition || 
          markerPosition[0] !== newPosition[0] || 
          markerPosition[1] !== newPosition[1]) {
        setMarkerPosition(newPosition);
      }
    }
  }, [location.coordinates]);

  return (
    <div className="event-location-picker">
      {/* Поле поиска */}
      <div className="location-search-container">
        <label className="location-search-label">
          <MapPin size={16} />
          Поиск места
        </label>
        <div className="location-search-input-wrapper">
          <Search size={18} className="location-search-icon" />
          <input
            type="text"
            className="location-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
            placeholder="Например: Астраханская область, Харабали, посёлок Бугор"
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

      {/* Мини-карта */}
      <div className="location-map-container">
        <MiniEventMap
          height="250px"
          center={markerPosition || [55.7558, 37.6176]}
          zoom={markerPosition ? 15 : 10}
          markerPosition={markerPosition}
          onMarkerPositionChange={handleMarkerPositionChange}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Кнопка "Указать точнее" */}
      {markerPosition && (
        <button
          type="button"
          className="location-precise-button"
          onClick={onPreciseClick}
        >
          <MapPin size={16} />
          Указать точнее на карте
        </button>
      )}
    </div>
  );
};

export default EventLocationPicker;

