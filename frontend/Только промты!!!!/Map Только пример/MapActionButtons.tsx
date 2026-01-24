import React, { useState } from 'react';
import { Settings, Heart, Layers, MapPin, Search } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import './MapActionButtons.css';

interface MapActionButtonsProps {
  onSettingsClick: () => void;
  onFavoritesClick: () => void;
  favoritesCount: number;
  onLegendClick: () => void;
  onAddMarkerClick: () => void;
  isAddingMarkerMode: boolean;
  onSearchClick?: () => void;
}

const MapActionButtons: React.FC<MapActionButtonsProps> = ({
  onSettingsClick,
  onFavoritesClick,
  favoritesCount,
  onLegendClick,
  onAddMarkerClick,
  isAddingMarkerMode,
  onSearchClick,
}) => {
  const { isDarkMode } = useTheme();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const buttons = [
    {
      id: 'settings',
      icon: Settings,
      label: 'Настройки карты',
      onClick: onSettingsClick,
      ariaLabel: 'Открыть настройки карты',
    },
    {
      id: 'favorites',
      icon: Heart,
      label: 'Избранное',
      onClick: onFavoritesClick,
      ariaLabel: 'Открыть избранное',
      badge: favoritesCount > 0 ? favoritesCount : undefined,
    },
    {
      id: 'legend',
      icon: Layers,
      label: 'Легенда карты',
      onClick: onLegendClick,
      ariaLabel: 'Открыть легенду карты',
    },
    {
      id: 'add-marker',
      icon: MapPin,
      label: 'Добавить метку на карту',
      onClick: onAddMarkerClick,
      ariaLabel: 'Добавить метку на карту',
      isActive: isAddingMarkerMode,
    },
  ];

  // Добавляем поиск, если передан обработчик
  if (onSearchClick) {
    buttons.push({
      id: 'search',
      icon: Search,
      label: 'Поиск мест или меток',
      onClick: onSearchClick,
      ariaLabel: 'Открыть поиск',
    });
  }

  const handleKeyDown = (e: React.KeyboardEvent, onClick: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      className={`map-action-buttons-container ${isDarkMode ? 'dark' : ''}`}
      role="toolbar"
      aria-label="Действия на карте"
    >
      {buttons.map((button) => {
        const Icon = button.icon;
        const isActive = button.isActive || false;
        const isHovered = hoveredButton === button.id;

        return (
          <div
            key={button.id}
            className="map-action-button-wrapper"
            onMouseEnter={() => setHoveredButton(button.id)}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <button
              className={`map-action-button ${isDarkMode ? 'dark' : ''} ${isActive ? 'active' : ''}`}
              onClick={button.onClick}
              onKeyDown={(e) => handleKeyDown(e, button.onClick)}
              aria-label={button.ariaLabel}
              role="button"
              tabIndex={0}
            >
              <Icon size={20} />
              {button.badge && (
                <span className="map-action-badge" aria-label={`${favoritesCount} избранных мест`}>
                  {button.badge}
                </span>
              )}
            </button>
            {isHovered && (
              <div className="map-action-tooltip" role="tooltip">
                {button.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MapActionButtons;


