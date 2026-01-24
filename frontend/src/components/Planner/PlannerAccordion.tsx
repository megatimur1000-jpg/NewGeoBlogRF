import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaRoute, FaCar, FaWalking, FaBicycle, FaMapMarkedAlt, FaMapMarkerAlt, FaSearch, FaPlus, FaTrash, FaChevronDown, FaChevronUp, FaPlay, FaCog, FaRoad, FaClock, FaTimes, FaStar } from 'react-icons/fa';
import { geocodingService, Place } from '../../services/geocodingService';
import CoordinateInput from './CoordinateInput';
import ActivePointsList from './ActivePointsList';
import { RoutePoint } from '../../types/routeBuilder';
import { GlassAccordion, GlassButton } from '../Glass';

interface RouteSettings {
  transportType: 'driving-car' | 'foot-walking' | 'cycling-regular' | 'driving-hgv' | 'driving-bus' | 'cycling-road' | 'cycling-mountain' | 'cycling-electric' | 'public-transport' | 'motorcycle' | 'scooter';
  optimization: 'fastest' | 'shortest' | 'balanced';
  avoidHighways: boolean;
  avoidTolls: boolean;
  showAlternatives: boolean;
}

// Конфигурация транспорта с реальными скоростями
const TRANSPORT_CONFIG = {
  'driving-car': { name: 'Автомобиль', icon: '🚗', speed: 50, unit: 'км/ч', color: 'blue' },
  'driving-hgv': { name: 'Грузовик', icon: '🚛', speed: 40, unit: 'км/ч', color: 'orange' },
  'driving-bus': { name: 'Автобус', icon: '🚌', speed: 35, unit: 'км/ч', color: 'yellow' },
  'motorcycle': { name: 'Мотоцикл', icon: '🏍️', speed: 60, unit: 'км/ч', color: 'red' },
  'scooter': { name: 'Скутер', icon: '🛵', speed: 30, unit: 'км/ч', color: 'purple' },
  'foot-walking': { name: 'Пешком', icon: '🚶', speed: 5, unit: 'км/ч', color: 'green' },
  'cycling-regular': { name: 'Велосипед', icon: '🚴', speed: 15, unit: 'км/ч', color: 'teal' },
  'cycling-road': { name: 'Шоссейный велосипед', icon: '🚴‍♂️', speed: 25, unit: 'км/ч', color: 'cyan' },
  'cycling-mountain': { name: 'Горный велосипед', icon: '🚵', speed: 12, unit: 'км/ч', color: 'brown' },
  'cycling-electric': { name: 'Электровелосипед', icon: '🛴', speed: 20, unit: 'км/ч', color: 'lime' },
  'public-transport': { name: 'Общественный транспорт', icon: '🚇', speed: 25, unit: 'км/ч', color: 'indigo' }
};

interface AccordionRoutePoint {
  id: string;
  address: string;
  coordinates?: [number, number];
  type: 'start' | 'waypoint' | 'end';
}

interface PlannerAccordionProps {
  onBuildRoute?: (points?: AccordionRoutePoint[]) => void;
  onSettingsChange?: (settings: RouteSettings) => void;
  onClose?: () => void;
  // Unified route builder props (optional, for new system)
  activePoints?: RoutePoint[];
  onRemovePoint?: (pointId: string) => void;
  onTogglePoint?: (pointId: string) => void;
  onReorderPoints?: ((fromIndex: number, toIndex: number) => void) | ((newOrder: string[]) => void);
  onAddCoordinatePoint?: () => void;
  onAddSearchPoint?: () => void;
  onAddSearchPointFromForm?: (address: string, coordinates: [number, number]) => void;
  onAddFavoritePoint?: () => void;
  onBuildRouteFromPoints?: () => void;
  canBuildRoute?: boolean;
  isBuilding?: boolean;
  showSearchForm?: boolean;
  onSearchFormClose?: () => void;
  routeStats?: {
    distance?: number;
    duration?: number;
    totalPoints?: number;
    estimatedDistance?: number;
    estimatedDuration?: number;
    canBuildRoute?: boolean;
  };
}

// Стили в стиле ElegantAccordionForm - растянутые на всю панель
const Wrapper = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
  border: 2px solid #bcbcbc;
  width: 100%;
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  font-size: 15px;
  overflow: hidden;
  min-width: 0;
`;

const AccordionBox = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: none;
  overflow: hidden;
  border: none;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  
  /* Кастомный скроллбар */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const Header = styled.div`
  background: #dadada;
  color: #222;
  font-size: 1.08em;
  font-weight: bold;
  padding: 12px 0;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  letter-spacing: 0.01em;
  text-align: center;
  min-width: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AccordionSection = styled.div<{ $active?: boolean }>`
  background: ${({ $active }) => ($active ? '#f4f4f4' : '#fff')};
  color: #222;
  display: flex;
  align-items: center;
  padding: 0;
  border-bottom: 1.5px solid #bcbcbc;
  transition: background 0.2s;
  cursor: pointer;
  position: relative;
  min-width: 0;
`;

const IconBox = styled.div<{ $active?: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 1.1em;
  flex-shrink: 0;
`;

const SectionTitle = styled.div`
  flex: 1;
  font-weight: 600;
  font-size: 0.98em;
  padding: 0 0 0 2px;
  min-width: 0;
`;

const Chevron = styled.div`
  padding: 0 10px;
  color: #888;
  font-size: 1em;
  flex-shrink: 0;
`;

const SectionContent = styled.div`
  background: #fff;
  color: #222;
  padding: 8px 12px 8px 44px;
  font-size: 0.95em;
  border-bottom: 1.5px solid #bcbcbc;
  animation: fadeIn 0.2s;
  min-width: 0;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px);}
    to { opacity: 1; transform: none;}
  }
`;


const ActionButton = styled.button`
  background: #fff;
  color: #222;
  border: 1.5px solid #bcbcbc;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: bold;
  font-size: 0.95em;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  margin-bottom: 8px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ActionButtonsContainer = styled.div`
  background: #f8f8f8;
  padding: 16px;
  border-top: 1.5px solid #bcbcbc;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 5px 8px;
  border-radius: 8px;
  font-size: 13px;
  background: #e3e3e3;
  color: #222;
  border: none;
  margin-bottom: 6px;
  box-sizing: border-box;
  min-width: 0;
`;

const Select = styled.select`
  width: 100%;
  padding: 5px 8px;
  border-radius: 8px;
  font-size: 13px;
  background: #e3e3e3;
  color: #222;
  border: none;
  margin-bottom: 6px;
  box-sizing: border-box;
  min-width: 0;
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #222;
  cursor: pointer;
  margin-bottom: 6px;
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #7bc043;
  }
`;

const RoutePointItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 6px;
  background: #f8f8f8;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
`;

const PointIcon = styled.div<{ type: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
  background-color: ${({ type }) => 
    type === 'start' ? '#10b981' : 
    type === 'end' ? '#ef4444' : '#3b82f6'
  };
  flex-shrink: 0;
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #bcbcbc;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 10;
  max-height: 120px;
  overflow-y: auto;
`;

const SearchResultItem = styled.div`
  padding: 6px 8px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const AddButton = styled.button`
  width: 100%;
  padding: 6px 8px;
  background: #e3e3e3;
  border: 1px solid #bcbcbc;
  border-radius: 6px;
  color: #222;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #d0d0d0;
  }
`;

const PlannerAccordion: React.FC<PlannerAccordionProps> = ({ 
  onBuildRoute, 
  onSettingsChange,
  onClose,
  // unified props (optional)
  activePoints,
  onRemovePoint,
  onTogglePoint,
  onReorderPoints,
  onAddCoordinatePoint,
  onAddSearchPoint,
  onAddSearchPointFromForm,
  onAddFavoritePoint,
  onBuildRouteFromPoints,
  canBuildRoute,
  isBuilding,
  showSearchForm,
  onSearchFormClose,
  routeStats
}) => {
  const [settings, setSettings] = useState<RouteSettings>({
    transportType: 'driving-car',
    optimization: 'fastest',
    avoidHighways: false,
    avoidTolls: false,
    showAlternatives: false
  });

  // Состояния для модальных окон
  const [showCoordinateInput, setShowCoordinateInput] = useState(false);

  // Состояния для формы поиска адресов
  const [routePoints, setRoutePoints] = useState<AccordionRoutePoint[]>([
    { id: 'start', address: '', type: 'start' },
    { id: 'end', address: '', type: 'end' }
  ]);

  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchPoint, setActiveSearchPoint] = useState<string | null>(null);

  // Состояния для аккордеона
  const [openSections, setOpenSections] = useState<{
    points: boolean;
    searchForm: boolean;
    markersList: boolean;
    transport: boolean;
    optimization: boolean;
    time: boolean;
    options: boolean;
  }>({
    points: true,
    searchForm: showSearchForm || false,
    markersList: false,
    transport: false,
    optimization: false,
    time: false,
    options: false
  });

  // Уведомляем родительский компонент об изменениях настроек
  useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  // Синхронизируем с пропсом showSearchForm
  useEffect(() => {
    if (showSearchForm !== undefined) {
      setOpenSections(prev => ({ ...prev, searchForm: showSearchForm }));
    }
  }, [showSearchForm]);

  const handleSettingChange = (key: keyof RouteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Переключение секций аккордеона
  const toggleSection = (section: keyof typeof openSections | '') => {
    if (!section) return;
    setOpenSections(prev => {
      const newState = { ...prev, [section]: !prev[section] };
      // Если закрываем форму поиска, уведомляем родительский компонент
      if (section === 'searchForm' && !newState.searchForm && onSearchFormClose) {
        onSearchFormClose();
      }
      return newState;
    });
  };

  // Поиск адреса с debounce
  const handleSearchAddress = async (query: string, pointId: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setActiveSearchPoint(null);
      return;
    }

    setActiveSearchPoint(pointId);
    setIsSearching(true);
    
    try {
      const places = await geocodingService.searchPlaces(query);
      setSearchResults(places);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };


  // Добавление промежуточной точки
  const addWaypoint = () => {
    const newWaypoint: AccordionRoutePoint = {
      id: `waypoint-${Date.now()}`,
      address: '',
      type: 'waypoint'
    };
    setRoutePoints(prev => {
      const newPoints = [...prev];
      // Вставляем перед конечной точкой
      newPoints.splice(newPoints.length - 1, 0, newWaypoint);
      return newPoints;
    });
  };

  // Удаление точки из формы
  const removeFormPoint = (id: string) => {
    if (routePoints.length <= 2) return; // Не удаляем начальную и конечную точки
    setRoutePoints(prev => prev.filter(point => point.id !== id));
  };

  // Обновление адреса точки
  const updatePointAddress = (id: string, address: string) => {
    setRoutePoints(prev => prev.map(point => 
      point.id === id ? { ...point, address } : point
    ));
  };

  // Выбор результата поиска
  const selectSearchResult = (pointId: string, place: Place) => {
    if (!place.coordinates || place.coordinates.length !== 2) {
      return;
    }
    
    updatePointAddress(pointId, place.label);
    setRoutePoints(prev => prev.map(point => 
      point.id === pointId ? { ...point, coordinates: place.coordinates } : point
    ));
    setSearchResults([]);
    setActiveSearchPoint(null);
    
    // Автоматически добавляем точку в единую систему и перестраиваем маршрут
    if (onAddSearchPointFromForm) {
      onAddSearchPointFromForm(place.label, place.coordinates);
    }
  };

  // Построение маршрута
  const handleBuildRoute = () => {
    const validPoints = routePoints.filter(point => {
      const hasAddress = point.address.trim();
      const hasCoordinates = point.coordinates && Array.isArray(point.coordinates) && point.coordinates.length === 2;
      return hasAddress && hasCoordinates;
    });
    
    // Добавляем все точки из формы в единую систему
    validPoints.forEach(point => {
      if (onAddSearchPointFromForm && point.coordinates) {
        onAddSearchPointFromForm(point.address, point.coordinates);
      }
    });
    
    // Передаем точки из формы в единую функцию построения маршрута
    onBuildRoute?.(validPoints);
  };

  // Проверяем, можно ли построить маршрут
  const canBuildFromForm = routePoints.filter(point => {
    const hasAddress = point.address.trim();
    const hasCoordinates = point.coordinates && Array.isArray(point.coordinates) && point.coordinates.length === 2;
    return hasAddress && hasCoordinates;
  }).length >= 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ScrollableContent style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
          {/* Точки маршрута */}
        <GlassAccordion
          title="Точки маршрута"
          defaultOpen={openSections.points}
          onToggle={(isOpen) => toggleSection(isOpen ? 'points' : '')}
        >
            {activePoints && activePoints.length > 0 ? (
              <div className="space-y-4">
                {/* Заголовок с количеством точек */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {activePoints.length}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Активные точки</h3>
                      <p className="text-xs text-gray-600">
                        {activePoints.filter(p => p.isActive).length} из {activePoints.length} включены
                      </p>
                    </div>
                  </div>
                  {canBuildRoute && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium">Готов к построению</span>
                    </div>
                  )}
                </div>

                <ActivePointsList
                  points={activePoints}
                  onRemovePoint={onRemovePoint || (() => {})}
                  onTogglePoint={onTogglePoint || (() => {})}
                  onReorderPoints={(newOrder: string[]) => {
                    if (onReorderPoints) {
                      // Проверяем тип функции onReorderPoints
                      if (onReorderPoints.length === 1) {
                        (onReorderPoints as (newOrder: string[]) => void)(newOrder);
                      }
                    }
                  }}
                  onAddCoordinatePoint={onAddCoordinatePoint || (() => {})}
                  onAddSearchPoint={onAddSearchPoint || (() => {})}
                  onAddFavoritePoint={onAddFavoritePoint || (() => {})}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaMapMarkerAlt className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Нет активных точек</h3>
                <p className="text-sm text-gray-500 mb-4">Добавьте точки для построения маршрута</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <FaMapMarkerAlt className="text-green-500" />
                    <span>Клик по карте</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <FaSearch className="text-blue-500" />
                    <span>Поиск адреса</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <FaStar className="text-yellow-500" />
                    <span>Из избранного</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <FaRoute className="text-purple-500" />
                    <span>Ввод координат</span>
                  </div>
                </div>
              </div>
            )}
        </GlassAccordion>

        {/* Форма поиска адресов */}
        <GlassAccordion
          title="Поиск адресов"
          defaultOpen={openSections.searchForm}
          onToggle={(isOpen) => toggleSection(isOpen ? 'searchForm' : '')}
        >
            <div className="space-y-3">
              {routePoints.map((point, index) => (
                <div key={point.id} className="relative">
                  <div className="flex items-center gap-2 mb-1">
                    <PointIcon type={point.type}>
                      {point.type === 'start' ? 'A' : point.type === 'end' ? 'B' : index}
                    </PointIcon>
                    <span className="text-sm font-medium text-gray-700">
                      {point.type === 'start' ? 'Откуда' : point.type === 'end' ? 'Куда' : `Точка ${index}`}
                    </span>
                    {point.type === 'waypoint' && (
                      <button
                        onClick={() => removeFormPoint(point.id)}
                        className="text-red-500 hover:text-red-700 ml-auto"
                        title="Удалить точку"
                      >
                        <FaTimes size={12} />
                      </button>
                    )}
                  </div>
                  
                  <Input
                    type="text"
                    placeholder={`Введите адрес ${point.type === 'start' ? 'отправления' : point.type === 'end' ? 'назначения' : 'промежуточной точки'}`}
                    value={point.address}
                    onChange={(e) => {
                      updatePointAddress(point.id, e.target.value);
                      handleSearchAddress(e.target.value, point.id);
                    }}
                  />
                  
                  {/* Результаты поиска */}
                  {activeSearchPoint === point.id && searchResults.length > 0 && (
                    <SearchResults>
                      {searchResults.map((place, idx) => (
                        <SearchResultItem
                          key={idx}
                          onClick={() => selectSearchResult(point.id, place)}
                        >
                          <div className="font-medium">{place.label}</div>
                          {(place as any).address && (
                            <div className="text-gray-500 text-xs">{(place as any).address}</div>
                          )}
                        </SearchResultItem>
                      ))}
                    </SearchResults>
                  )}
                  
                  {isSearching && activeSearchPoint === point.id && (
                    <div className="text-xs text-gray-500 mt-1">Поиск...</div>
                  )}
                </div>
              ))}
              
              {/* Кнопка добавления промежуточной точки */}
              <AddButton onClick={addWaypoint}>
                <FaPlus className="inline mr-1" />
                Добавить промежуточную точку
              </AddButton>
            </div>
        </GlassAccordion>

        {/* Тип транспорта */}
        <GlassAccordion
          title="Тип транспорта"
          defaultOpen={openSections.transport}
          onToggle={(isOpen) => toggleSection(isOpen ? 'transport' : '')}
        >
            <div className="space-y-4">
              {/* Основные типы транспорта */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">🚗 Автомобильный транспорт</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(TRANSPORT_CONFIG).filter(([key]) => key.startsWith('driving-') || key === 'motorcycle' || key === 'scooter').map(([key, config]) => (
              <button
                      key={key}
                      className={`p-3 rounded-lg border-2 transition-colors text-xs ${
                        settings.transportType === key 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                      onClick={() => handleSettingChange('transportType', key as any)}
              >
                      <div className="text-lg mb-1">{config.icon}</div>
                      <div className="font-medium">{config.name}</div>
                      <div className="text-xs text-gray-500">{config.speed} {config.unit}</div>
              </button>
                  ))}
                </div>
              </div>

              {/* Велосипедный транспорт */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">🚴 Велосипедный транспорт</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(TRANSPORT_CONFIG).filter(([key]) => key.startsWith('cycling-')).map(([key, config]) => (
        <button
                      key={key}
                      className={`p-3 rounded-lg border-2 transition-colors text-xs ${
                        settings.transportType === key 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                      onClick={() => handleSettingChange('transportType', key as any)}
              >
                      <div className="text-lg mb-1">{config.icon}</div>
                      <div className="font-medium">{config.name}</div>
                      <div className="text-xs text-gray-500">{config.speed} {config.unit}</div>
        </button>
                  ))}
                </div>
              </div>

              {/* Пеший и общественный транспорт */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">🚶 Пеший и общественный транспорт</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(TRANSPORT_CONFIG).filter(([key]) => key === 'foot-walking' || key === 'public-transport').map(([key, config]) => (
        <button
                      key={key}
                      className={`p-3 rounded-lg border-2 transition-colors text-xs ${
                        settings.transportType === key 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                      onClick={() => handleSettingChange('transportType', key as any)}
              >
                      <div className="text-lg mb-1">{config.icon}</div>
                      <div className="font-medium">{config.name}</div>
                      <div className="text-xs text-gray-500">{config.speed} {config.unit}</div>
        </button>
                  ))}
                </div>
      </div>
            
              {/* Выпадающий список для быстрого выбора */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">⚡ Быстрый выбор</h4>
            <Select
              value={settings.transportType}
                  onChange={(e) => handleSettingChange('transportType', e.target.value as any)}
                  className="w-full"
                >
                  {Object.entries(TRANSPORT_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.name} ({config.speed} {config.unit})
                    </option>
                  ))}
            </Select>
              </div>
            </div>
        </GlassAccordion>

        {/* Информация о маршруте */}
        <GlassAccordion
          title="Информация о маршруте"
          defaultOpen={openSections.optimization}
          onToggle={(isOpen) => toggleSection(isOpen ? 'optimization' : '')}
        >
            <div className="text-xs text-gray-600 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <FaMapMarkedAlt className="text-blue-500" />
                <span>Точек: {routePoints.length}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{TRANSPORT_CONFIG[settings.transportType]?.icon || '🚗'}</span>
                <span>Транспорт: {TRANSPORT_CONFIG[settings.transportType]?.name || 'Неизвестно'}</span>
                <span className="text-xs text-gray-500">({TRANSPORT_CONFIG[settings.transportType]?.speed || 0} {TRANSPORT_CONFIG[settings.transportType]?.unit || 'км/ч'})</span>
              </div>
              <div className="flex items-center gap-2">
                <FaRoad className="text-purple-500" />
                <span>Оптимизация: {settings.optimization === 'fastest' ? 'Быстрый' : settings.optimization === 'shortest' ? 'Короткий' : 'Сбалансированный'}</span>
              </div>
          </div>
            
            <Select
              value={settings.optimization}
              onChange={(e) => handleSettingChange('optimization', e.target.value)}
            >
              <option value="fastest">⚡ Самый быстрый</option>
              <option value="shortest">📏 Самый короткий</option>
              <option value="balanced">⚖️ Сбалансированный</option>
            </Select>
        </GlassAccordion>

        {/* Временные настройки */}
        <GlassAccordion
          title="Временные настройки"
          defaultOpen={openSections.time}
          onToggle={(isOpen) => toggleSection(isOpen ? 'time' : '')}
        >
            <div className="text-xs text-gray-600 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <FaClock className="text-blue-500" />
                <span>Время построения: ~2-5 сек</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <FaRoute className="text-green-500" />
                <span>Маршрут: {routePoints.filter(p => p.address.trim()).length}/{routePoints.length} точек</span>
      </div>
    </div>
        </GlassAccordion>

        {/* Дополнительные опции */}
        <GlassAccordion
          title="Дополнительные опции"
          defaultOpen={openSections.options}
          onToggle={(isOpen) => toggleSection(isOpen ? 'options' : '')}
        >
            <Checkbox>
              <input
                type="checkbox"
                checked={settings.avoidHighways}
                onChange={(e) => handleSettingChange('avoidHighways', e.target.checked)}
              />
              Избегать автомагистрали
            </Checkbox>
            
            <Checkbox>
              <input
                type="checkbox"
                checked={settings.avoidTolls}
                onChange={(e) => handleSettingChange('avoidTolls', e.target.checked)}
              />
              Избегать платные дороги
            </Checkbox>
            
            <Checkbox>
              <input
                type="checkbox"
                checked={settings.showAlternatives}
                onChange={(e) => handleSettingChange('showAlternatives', e.target.checked)}
              />
              Показать альтернативы
            </Checkbox>
        </GlassAccordion>
        </ScrollableContent>

        {/* Статистика маршрута в реальном времени */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200 p-4" style={{ flexShrink: 0 }}>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-2">
              <div className="flex items-center space-x-1">
                <span className="text-lg">📍</span>
                <span className="text-sm font-medium text-gray-700">
                  {activePoints?.filter(p => p.isActive).length || 0} активных точек
                </span>
              </div>
              {routeStats && (routeStats.distance ?? 0) > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-lg">📏</span>
                  <span className="text-sm font-medium text-blue-700">
                    {routeStats.distance?.toFixed(1) ?? 0} км
                  </span>
                </div>
              )}
              {routeStats && (routeStats.duration ?? 0) > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-lg">⏱️</span>
                  <span className="text-sm font-medium text-green-700">
                    {Math.round((routeStats.duration ?? 0) / 60)} мин
                  </span>
            </div>
              )}
              {routeStats && (routeStats.distance ?? 0) > 0 && TRANSPORT_CONFIG[settings.transportType] && (
                <div className="flex items-center space-x-1">
                  <span className="text-lg">🚀</span>
                  <span className="text-sm font-medium text-purple-700">
                    ~{Math.round((routeStats.distance ?? 0) / TRANSPORT_CONFIG[settings.transportType].speed * 60)} мин
                  </span>
                  <span className="text-xs text-gray-500">({TRANSPORT_CONFIG[settings.transportType].speed} км/ч)</span>
            </div>
              )}
          </div>
            <div className="text-xs text-gray-600">
              {canBuildRoute ? (
                <span className="text-green-600 font-medium">✅ Маршрут готов к построению</span>
              ) : (
                <span className="text-orange-600">⚠️ Добавьте минимум 2 точки для построения маршрута</span>
        )}
            </div>
          </div>
        </div>
      
      {/* Модальные окна */}
      {showCoordinateInput && (
        <CoordinateInput
          onAdd={(data) => {
            // Добавляем точку через единую систему
            if (onAddCoordinatePoint) {
              onAddCoordinatePoint();
            }
            setShowCoordinateInput(false);
          }}
          onClose={() => setShowCoordinateInput(false)}
        />
      )}
    </div>
  );
};

export default PlannerAccordion;
