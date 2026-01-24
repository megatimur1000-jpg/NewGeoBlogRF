import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useMapStyle } from '../../hooks/useMapStyle';
import { MapContainer, MapWrapper, LoadingOverlay, ErrorMessage, LegendButton, GlobalLeafletPopupStyles } from './Map.styles';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import MarkerPopup from './MarkerPopup';
import { MarkerData } from '../../types/marker';
import styled from 'styled-components';
import MapLegend from './MapLegend';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { ElegantAccordionForm } from './ElegantAccordionForm';
import { placeDiscoveryService, DiscoveredPlace } from '../../services/placeDiscoveryService';
import AddMarkerButton from './AddMarkerButton';
import FavoritesButtonComponent from './FavoritesButton';
import MiniMarkerPopup from './MiniMarkerPopup';
import { markerService } from '../../services/markerService';
import { activityService } from '../../services/activityService';

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const markerCategoryStyles: { [key: string]: { color: string; icon: string; user?: boolean } } = {
  attraction:    { color: '#3498db', icon: 'fa-star' },
  restaurant:    { color: '#e74c3c', icon: 'fa-utensils' },
  hotel:         { color: '#8e44ad', icon: 'fa-hotel' },
  nature:        { color: '#27ae60', icon: 'fa-tree' },
  culture:       { color: '#f1c40f', icon: 'fa-landmark' },
  entertainment: { color: '#f39c12', icon: 'fa-masks-theater' },
  transport:     { color: '#16a085', icon: 'fa-bus' },
  service:       { color: '#34495e', icon: 'fa-concierge-bell' },
  other:         { color: '#7f8c8d', icon: 'fa-question' },
  event:         { color: '#9b59b6', icon: 'fa-calendar-alt' },
  blog:          { color: '#2ecc71', icon: 'fa-pen-nib' },
  route:         { color: '#f39c12', icon: 'fa-route' },
  chat:          { color: '#1abc9c', icon: 'fa-comment-dots' },
  user_poi:      { color: '#e67e22', icon: 'fa-map-pin', user: true },
  default:       { color: '#7f8c8d', icon: 'fa-map-marker-alt' }
};

// Стилизованный компонент для сообщения на карте
const MapMessage = styled.div`
  position: absolute;
  top: 20px; /* Сверху */
  left: 50%;
  transform: translateX(-50%); /* Центрирование по горизонтали */
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px 25px;
  border-radius: 8px;
  font-size: 1.2em;
  z-index: 999;
  pointer-events: none;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
`;

interface MapProps {
  center: [number, number];
  zoom: number;
  markers: MarkerData[];
  onMapClick?: (coordinates: [number, number]) => void;
  onHashtagClickFromPopup?: (hashtag: string) => void;
  flyToCoordinates?: [number, number] | null;
  selectedMarkerIdForPopup?: string | null;
  setSelectedMarkerIdForPopup: (id: string | null) => void; // Добавляем функцию для закрытия попапа
  onAddToFavorites: (marker: MarkerData) => void;
  onAddToBlog?: (marker: MarkerData) => void; // Функция для добавления метки в блог
  onFavoritesClick?: () => void; // Функция для открытия избранного
  favoritesCount?: number; // Количество избранных элементов
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void; // Обработчик изменения границ карты
  radius: number;
  isFavorite: (marker: MarkerData) => boolean;
  mapSettings: {
    mapType: string;
    showTraffic: boolean;
    showBikeLanes: boolean;
    showHints: boolean;
    themeColor: string;
  };
  filters: {
    categories: string[];
    radiusOn: boolean;
    radius: number;
    preset: string | null;
  };
  searchRadiusCenter: [number, number];
  onSearchRadiusCenterChange: (center: [number, number]) => void;
  routeLine?: [number, number][];
  selectedMarkerIds?: string[]; // ID меток с галочками в FavoritesPanel
  zones?: Array<{ severity?: string; polygons: number[][][]; name?: string; type?: string }>;
  routeData?: {
    id: string;
    title: string;
    polyline: [number, number][];
    markers: any[];
  } | null;
}

// Исправляем проблему с иконками Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export const defaultMarkerIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Вынесем функцию выбора tileLayer по mapType
function getTileLayer(mapType: string) {
  switch (mapType) {
    case 'dark':
      return {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '© OpenStreetMap contributors, © CARTO'
      };
    case 'satellite':
      return {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors, © OpenTopoMap'
      };
    default:
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors'
      };
  }
}

// Новая функция для получения дополнительных слоев
function getAdditionalLayers(showTraffic: boolean, showBikeLanes: boolean) {
  const layers: L.TileLayer[] = [];
  
  if (showTraffic) {
    // Используем специальный слой для пробок (симуляция)
    const trafficLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      opacity: 0.4,
      className: 'traffic-layer',
      // Добавляем специальные параметры для "пробок"
      zIndex: 1000
    });
    layers.push(trafficLayer);
  }
  
  if (showBikeLanes) {
    // Слой с велосипедными дорожками (симуляция)
    const bikeLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      opacity: 0.3,
      className: 'bike-lanes-layer',
      // Добавляем специальные параметры для велодорожек
      zIndex: 1001
    });
    layers.push(bikeLayer);
  }
  
  return layers;
}

// Исправим функцию для создания визуальных индикаторов
function createLayerIndicator(layerType: 'traffic' | 'bike') {
  const div = document.createElement('div');
  div.className = 'layer-indicator';
  div.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
    background: ${layerType === 'traffic' ? '#ff6b6b' : '#4ecdc4'};
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    margin: 5px;
  `;
  div.innerHTML = `${layerType === 'traffic' ? '🚗 Пробки' : '🚴 Велодорожки'} ВКЛ`;
  
  return div;
}

const Map: React.FC<MapProps> = ({
  center, zoom, markers, onMapClick, onHashtagClickFromPopup,
  flyToCoordinates, selectedMarkerIdForPopup, setSelectedMarkerIdForPopup, onAddToFavorites, onAddToBlog, isFavorite,
  onFavoritesClick, favoritesCount, mapSettings, filters, searchRadiusCenter, onSearchRadiusCenterChange, selectedMarkerIds, onBoundsChange, zones = [], routeData}) => {

  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const mapRef = useRef<L.Map | null>(null);
  const activePopupRoots = useRef<Record<string, Root>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapStyle = useMapStyle();
  const [markersData, setMarkersData] = useState<MarkerData[]>([]);

  const [isAddingMarkerMode, setIsAddingMarkerMode] = useState(false);
  const [coordsForNewMarker, setCoordsForNewMarker] = useState<[number, number] | null>(null);
  const [tempMarker, setTempMarker] = useState<L.Marker | null>(null);
  const [mapMessage, setMapMessage] = useState<string | null>(null);
  
  // Состояние для обнаруженного места
  const [discoveredPlace, setDiscoveredPlace] = useState<DiscoveredPlace | null>(null);
  const [isDiscoveringPlace, setIsDiscoveringPlace] = useState(false);

  const [miniPopup, setMiniPopup] = useState<{
    marker: MarkerData;
    position: { x: number; y: number };
  } | null>(null);

  // Используем useRef для получения актуальных значений состояния внутри обработчика событий Leaflet
  const isAddingMarkerModeRef = useRef(isAddingMarkerMode);
  const tempMarkerRef = useRef(tempMarker);

  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  const [legendOpen, setLegendOpen] = useState(false);

  const lastMiniPopupMarkerId = useRef<string | null>(null);

  // --- Новый useRef для tileLayer, чтобы можно было менять слой без пересоздания карты ---
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Функция для обнаружения места по координатам
  const handlePlaceDiscovery = async (latitude: number, longitude: number) => {
    try {
      setIsDiscoveringPlace(true);
      setMapMessage('🔍 Ищем информацию об этом месте...');
      
      // Проверяем, есть ли уже метка
      const hasExistingMarker = await placeDiscoveryService.checkExistingMarker(latitude, longitude);
      if (hasExistingMarker) {
        setMapMessage('⚠️ Здесь уже есть метка');
        setTimeout(() => setMapMessage(null), 3000);
        setIsDiscoveringPlace(false);
        return false;
      }
      
      // Ищем место через сервис
      const searchResult = await placeDiscoveryService.discoverPlace(latitude, longitude);
      
      if (searchResult.places.length > 0 && searchResult.bestMatch) {
        // Устанавливаем обнаруженное место
        setDiscoveredPlace(searchResult.bestMatch);
        setMapMessage(null);
        setIsDiscoveringPlace(false);
        return true; // Место найдено
      } else {
        setMapMessage('ℹ️ Место не найдено, можно добавить вручную');
        setTimeout(() => setMapMessage(null), 3000);
        setIsDiscoveringPlace(false);
        return false; // Место не найдено
      }
    } catch (error) {
      setMapMessage('❌ Ошибка при поиске места');
      setTimeout(() => setMapMessage(null), 3000);
      setIsDiscoveringPlace(false);
      return false;
    }
  };

  // Функции для работы с геопоиском удалены - теперь геопоиск интегрирован в форму

  // Вспомогательная функция для получения названия источника удалена - больше не используется

  // Функция для добавления новой метки
  const handleAddMarker = async (data: any) => {
    try {

      // Проверяем авторизацию
      const token = localStorage.getItem('token');
      if (!token) {
        setMapMessage('Ошибка: необходимо авторизоваться');
        setTimeout(() => setMapMessage(null), 3000);
        return;
      }
      
      // Создаем объект для markerService.createMarker
      const markerData = {
        title: data.title,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        category: data.category,
        hashtags: data.hashtags || '',
        photoUrls: data.photoUrls || '',
        address: data.address || ''
      };

      // Добавляем метку через API
      const newMarker = await markerService.createMarker(markerData);

      // Создаем активность для создания метки
      await activityService.createActivityHelper(
        'marker_created',
        'marker',
        newMarker.id,
        {
          title: newMarker.title,
          category: newMarker.category,
          coordinates: [newMarker.latitude, newMarker.longitude]
        }
      );

      // Добавляем новый маркер в локальное состояние
      setMarkersData(prev => {
        return [...prev, newMarker];
      });

      // Показываем сообщение об успехе
      setMapMessage('Метка успешно добавлена!');
      setTimeout(() => setMapMessage(null), 3000);

      // Новый маркер уже добавлен выше

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setMapMessage(`Ошибка при добавлении метки: ${errorMessage}`);
      setTimeout(() => setMapMessage(null), 5000);
    }
  };

  useEffect(() => {
    isAddingMarkerModeRef.current = isAddingMarkerMode;
  }, [isAddingMarkerMode]);

  useEffect(() => {
    tempMarkerRef.current = tempMarker;
  }, [tempMarker]);

  useEffect(() => {
    setMarkersData(markers);
  }, [markers]);

  // useEffect для ИНИЦИАЛИЗАЦИИ КАРТЫ (выполняется строго один раз при монтировании)
  useEffect(() => {
    // Эта проверка должна быть излишней, если зависимость пуста,
    // но оставляем на всякий случай для дополнительной надежности
    if (mapRef.current) {
      return;
    }

    const initMapAndLoadMarkers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const map = L.map('map', {
          center,
          zoom,
          zoomControl: false,
          attributionControl: true,
          preferCanvas: true,
        });

        // --- Используем функцию выбора слоя ---
        const tileLayerInfo = getTileLayer(mapSettings.mapType);
        const tileLayer = L.tileLayer(tileLayerInfo.url, {
          attribution: tileLayerInfo.attribution,
          maxZoom: 19,
          subdomains: 'abc',
        }).addTo(map);
        tileLayerRef.current = tileLayer;

        // --- Добавляем дополнительные слои при инициализации ---
        const additionalLayers = getAdditionalLayers(mapSettings.showTraffic, mapSettings.showBikeLanes);
        additionalLayers.forEach(layer => {
          layer.addTo(map);
        });

        L.control.zoom({
          position: 'bottomright',
        }).addTo(map);

        mapRef.current = map;

        // Обработчик изменения границ карты для ленивой загрузки
        map.on('moveend', () => {
          if (onBoundsChange) {
            const bounds = map.getBounds();
            onBoundsChange({
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest()
            });
          }
        });

        // Обработчик клика по карте для режима добавления метки
        map.on('click', async (e: L.LeafletMouseEvent) => {
          if (isAddingMarkerModeRef.current) {
            if (tempMarkerRef.current) {
              map.removeLayer(tempMarkerRef.current);
            }

            const tempIcon = L.divIcon({
              className: 'temp-marker-icon',
              html: '<div style="background-color: red; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });

            const newTempMarker = L.marker(e.latlng, { icon: tempIcon }).addTo(map);
            setTempMarker(newTempMarker);

            newTempMarker.on('click', async () => {
              // Центрируем карту на временной метке
              map.setView([e.latlng.lat, e.latlng.lng], map.getZoom());
              
              // При клике по временной метке - обнаруживаем место и показываем форму
              const placeFound = await handlePlaceDiscovery(e.latlng.lat, e.latlng.lng);
              
              // Всегда показываем форму, независимо от того, найдено место или нет
              setCoordsForNewMarker([e.latlng.lat, e.latlng.lng]);
              
              if (!placeFound) {
                setMapMessage('ℹ️ Место не найдено, можно добавить вручную');
                setTimeout(() => setMapMessage(null), 3000);
              }
            });

            setIsAddingMarkerMode(false);
            setMapMessage(null);
          } else {
            // Обычный клик по карте - ничего не делаем
            // Геопоиск и форма будут вызваны только при клике по временной метке
          }
          
          if (onMapClick) {
            onMapClick([e.latlng.lat, e.latlng.lng]);
          }
        });

        // --- Загрузка маркеров после инициализации карты ---
        // REMOVED: markerService.getAllMarkers() is now handled in MapPage.tsx
        // const fetchedMarkers = await markerService.getAllMarkers();
        // setMarkersData(fetchedMarkers);
        // --------------------------------------------------

        setIsLoading(false);
      } catch (err) {
        setError(t('map.error.initialization')); // Можно добавить t('map.error.load_markers')
        setIsLoading(false);
      }
    };

    initMapAndLoadMarkers();

    return () => {
      if (mapRef.current) {
        Object.values(activePopupRoots.current).forEach((root) => {
          try {
            root.unmount();
          } catch (err) {
            // Silent cleanup error
          }
        });
        activePopupRoots.current = {};

        if (tempMarkerRef.current) {
          mapRef.current.removeLayer(tempMarkerRef.current);
          tempMarkerRef.current = null;
        }

        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // MODIFIED: Removed `markersData` from dependencies as it's not loaded here anymore

  // --- Новый useEffect: реагируем на смену mapSettings.mapType ---
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const tileLayerInfo = getTileLayer(mapSettings.mapType);

    // Удаляем старый слой
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    // Добавляем новый слой
    const newTileLayer = L.tileLayer(tileLayerInfo.url, {
      attribution: tileLayerInfo.attribution,
      maxZoom: 19,
      subdomains: 'abc',
    }).addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [mapSettings.mapType]);

  // --- Новый useEffect: обработка пробок и велодорожек ---
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    
    const map = mapRef.current;
    
    // Удаляем старые дополнительные слои и индикаторы
    let removedCount = 0;
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer && 
          (layer.getContainer()?.className?.includes('traffic-layer') || 
           layer.getContainer()?.className?.includes('bike-lanes-layer'))) {
        map.removeLayer(layer);
        removedCount++;
      }
    });
    
    // Удаляем старые индикаторы
    const oldIndicators = document.querySelectorAll('.layer-indicator');
    oldIndicators.forEach(indicator => indicator.remove());
    
    // Добавляем новые слои
    const additionalLayers = getAdditionalLayers(mapSettings.showTraffic, mapSettings.showBikeLanes);
    
    additionalLayers.forEach((layer) => {
      layer.addTo(map);
      
      // Добавляем индикатор для каждого слоя
      const layerType = layer.getContainer()?.className?.includes('traffic-layer') ? 'traffic' : 'bike';
      const indicator = createLayerIndicator(layerType);
      map.getContainer().appendChild(indicator);
    });
    
}, [mapSettings.showTraffic, mapSettings.showBikeLanes]);

  // useEffect для обработки изменений center и zoom из пропсов
  // useEffect(() => {
  //   if (mapRef.current) {
  //     const currentCenter = mapRef.current.getCenter();
  //     const currentZoom = mapRef.current.getZoom();
  //     if (currentCenter.lat !== center[0] || currentCenter.lng !== center[1] || currentZoom !== zoom) {
      //       // Updating map view due to prop changes
  //       mapRef.current.setView(center, zoom);
  //     }
  //   }
  // }, [center, zoom]); // Зависит от пропсов center и zoom

  // useEffect для РЕНДЕРИНГА МАРКЕРОВ (реагирует на изменения markersData)
  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker && layer !== tempMarkerRef.current) { // Используем ref
        mapRef.current?.removeLayer(layer);
      }
    });

    // --- КЛАСТЕРИЗАЦИЯ ---
    // Удаляем старую группу кластеров, если есть
    if (markerClusterGroupRef.current) {
      mapRef.current.removeLayer(markerClusterGroupRef.current);
      markerClusterGroupRef.current = null;
    }

    // Создаём новую группу кластеров
    const markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      animate: true,
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="marker-cluster"><span>${count}</span></div>`,
          className: 'marker-cluster-custom',
          iconSize: [40, 40]
        });
      }
    });

    markersData.forEach((markerData) => {
      // Преобразуем latitude и longitude в числа
      const lat = parseFloat(markerData.latitude as any);
      const lng = parseFloat(markerData.longitude as any);
      if (!isNaN(lat) && !isNaN(lng)) {
        const markerCategory = markerData.category || 'default';
        const isHot = (markerData.rating || 0) >= 4.5;
        const style = markerCategoryStyles[markerCategory] || markerCategoryStyles.default;

        let iconHtml = `<i class="fas ${style.icon}"></i>`;
        let iconClass = `marker-icon marker-category-${markerCategory}`;
        if (style.user) iconClass += ' marker-user-poi';
        if (isHot) iconClass += ' marker-hot';

        // === ВАЖНО: СНАЧАЛА объявляем isInRadius ===
        const isInRadius = filters.radiusOn
          ? getDistanceFromLatLonInKm(
              searchRadiusCenter[0], searchRadiusCenter[1],
              markerData.latitude, markerData.longitude
            ) <= filters.radius
          : false;

        // --- Используем themeColor для выделения маркера в радиусе ---
        const iconSize: [number, number] = isInRadius ? [44, 44] : [30, 30];
        // Если маркер в радиусе — themeColor, иначе цвет категории
        const iconColor = isInRadius ? mapSettings.themeColor : style.color;

        const customIcon = L.divIcon({
          className: iconClass,
          html: `<div class="marker-base" style="background-color: ${iconColor};">${iconHtml}</div>`,
          iconSize: iconSize,
          iconAnchor: [iconSize[0] / 2, iconSize[1]],
        });

        const leafletMarker = L.marker([lat, lng], { icon: customIcon });
        (leafletMarker as any).markerData = markerData;

        const popupOptions = {
          className: `custom-marker-popup ${isDarkMode ? 'dark' : 'light'}`,
          autoPan: true,
          autoPanPadding: [50, 50],
          closeButton: false,
          maxWidth: 441,
          maxHeight: 312,
          offset: L.point(0, -10),
        };

        leafletMarker.bindPopup('', popupOptions);

        leafletMarker.on('popupopen', (e: L.PopupEvent) => {
          const popupContentDiv = e.popup.getElement()?.querySelector('.leaflet-popup-content');
          if (popupContentDiv) {
              const root = activePopupRoots.current[markerData.id] || createRoot(popupContentDiv);
              activePopupRoots.current[markerData.id] = root;

              const fullMarkerData: MarkerData = markerData;
              const isSelected = !!(selectedMarkerIdForPopup && selectedMarkerIdForPopup === markerData.id);

              // Добавляем класс selected к Leaflet попапу
              const popupElement = e.popup.getElement();
              if (popupElement) {
                if (isSelected) {
                  popupElement.classList.add('selected');
                } else {
                  popupElement.classList.remove('selected');
                }
              }

              root.render(
                <MarkerPopup
                  key={markerData.id}
                  marker={fullMarkerData}
                  onClose={() => {
                    if (leafletMarker.getPopup()) {
                      leafletMarker.closePopup();
                    }
                  }}
                  onHashtagClick={onHashtagClickFromPopup}
                  onMarkerUpdate={function (): void {
                    throw new Error('Function not implemented.');
                  }}
                  onAddToFavorites={onAddToFavorites}
                  onAddToBlog={onAddToBlog}
                  isFavorite={isFavorite(markerData)}
                  isSelected={isSelected}
                />
              );
          }
        });

        leafletMarker.on('popupclose', () => {
          const root = activePopupRoots.current[markerData.id];
          if (root) {
            root.unmount();
            delete activePopupRoots.current[markerData.id];
          }
        });

        leafletMarker.on('mouseover', () => {
          setMiniPopup({
            marker: markerData,
            position: latLngToContainerPoint(L.latLng(Number(markerData.latitude), Number(markerData.longitude)))
          });
        });
        leafletMarker.on('mouseout', () => {
          setMiniPopup(null);
        });
        leafletMarker.on('click', () => {
          setMiniPopup(null);
          setSelectedMarkerIdForPopup(markerData.id); // Открываем наш React попап вместо Leaflet
        });

        // --- showHints: если включено, показываем title как tooltip ---
        if (mapSettings.showHints) {
          leafletMarker.bindTooltip(markerData.title, { direction: 'top', offset: [0, -10] });
        }

        // Вместо leafletMarker.addTo(mapRef.current!) делаем:
        markerClusterGroup.addLayer(leafletMarker);
      } else {
        // Skip marker with invalid coordinates
      }
    });

    // --- Кастомизация цвета кластера по themeColor ---
    // Добавим CSS для кластера (можно вынести в CSS-файл)
    const style = document.createElement('style');
    style.innerHTML = `
      .marker-cluster-custom {
        background: ${mapSettings.themeColor} !important;
        color: #fff !important;
        border: 2px solid #fff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        border-radius: 50% !important;   /* <-- делает круг! */
        width: 40px !important;
        height: 40px !important;
        display: flex !important;
        align-items: center;
        justify-content: center;
      }
      .marker-cluster-custom span {
        color: #fff !important;
        font-size: 1.2em;
      }
      
      /* Исправляем скругление углов для всех Leaflet попапов */
      .leaflet-popup-content-wrapper {
        border-radius: 8px !important;
      }
      
      .leaflet-popup-content {
        margin: 0 !important;
        border-radius: 8px !important;
      }
      
      .leaflet-popup-tip {
        border-radius: 2px;
      }
      
      /* Исправляем скругление для выбранных попапов */
      .custom-marker-popup.selected .leaflet-popup-content-wrapper {
        border-radius: 8px !important;
      }
      
      .custom-marker-popup.selected .leaflet-popup-content {
        border-radius: 8px !important;
      }
      
      /* Исправляем скругление для выбранных Leaflet попапов */
      .leaflet-popup.selected .leaflet-popup-content-wrapper {
        border-radius: 8px !important;
      }
      
      .leaflet-popup.selected .leaflet-popup-content {
        border-radius: 8px !important;
        margin: 0 !important;
      }
      
      /* Дополнительно для кастомных попапов в состоянии selected */
      .custom-marker-popup.selected .leaflet-popup-content-wrapper {
        border-radius: 8px !important;
        overflow: hidden !important;
      }
      
      .custom-marker-popup.selected .leaflet-popup-content {
        border-radius: 8px !important;
        margin: 0 !important;
        overflow: hidden !important;
      }
      
      /* Принудительно применяем скругление ко всем элементам попапа */
      .custom-marker-popup .leaflet-popup-content-wrapper,
      .custom-marker-popup .leaflet-popup-content,
      .custom-marker-popup .leaflet-popup-tip {
        border-radius: 8px !important;
        overflow: hidden !important;
      }
      
      /* Дополнительно для всех Leaflet попапов с классом selected */
      .leaflet-popup.selected .leaflet-popup-content-wrapper {
        border-radius: 8px !important;
        overflow: hidden !important;
      }
      
      .leaflet-popup.selected .leaflet-popup-content {
        border-radius: 8px !important;
        margin: 0 !important;
        overflow: hidden !important;
      }
      
      /* Принудительно применяем скругление ко всем элементам всех попапов */
      .leaflet-popup .leaflet-popup-content-wrapper,
      .leaflet-popup .leaflet-popup-content,
      .leaflet-popup .leaflet-popup-tip {
        border-radius: 8px !important;
        overflow: hidden !important;
      }
      
      /* Агрессивно переопределяем все возможные стили Leaflet */
      .leaflet-popup-content-wrapper,
      .leaflet-popup-content,
      .leaflet-popup-tip {
        border-radius: 8px !important;
        overflow: hidden !important;
      }
      
      /* Дополнительно для всех попапов */
      .leaflet-popup * {
        border-radius: 8px !important;
      }
      
      /* Принудительно для всех состояний */
      .leaflet-popup,
      .leaflet-popup.selected,
      .custom-marker-popup,
      .custom-marker-popup.selected {
        border-radius: 8px !important;
      }
      
      .leaflet-popup .leaflet-popup-content-wrapper,
      .leaflet-popup.selected .leaflet-popup-content-wrapper,
      .custom-marker-popup .leaflet-popup-content-wrapper,
      .custom-marker-popup.selected .leaflet-popup-content-wrapper {
        border-radius: 8px !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);

    markerClusterGroup.addTo(mapRef.current);
    markerClusterGroupRef.current = markerClusterGroup;

    // Очистка стиля при размонтировании/перерисовке
    return () => {
      document.head.removeChild(style);
    };
    
    // Дополнительно применяем стили с высоким приоритетом
    const highPriorityStyle = document.createElement('style');
    highPriorityStyle.setAttribute('data-high-priority', 'true');
    highPriorityStyle.innerHTML = `
      /* Высокий приоритет для скругления углов */
      .leaflet-popup-content-wrapper,
      .leaflet-popup-content,
      .leaflet-popup-tip {
        border-radius: 8px !important;
        overflow: hidden !important;
      }
      
      .custom-marker-popup .leaflet-popup-content-wrapper,
      .custom-marker-popup .leaflet-popup-content,
      .custom-marker-popup .leaflet-popup-tip {
        border-radius: 8px !important;
        overflow: hidden !important;
      }
      
      .custom-marker-popup.selected .leaflet-popup-content-wrapper,
      .custom-marker-popup.selected .leaflet-popup-content,
      .custom-marker-popup.selected .leaflet-popup-tip {
        border-radius: 8px !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(highPriorityStyle);
    
    return () => {
      document.head.removeChild(style);
      if (document.head.contains(highPriorityStyle)) {
        document.head.removeChild(highPriorityStyle);
      }
    };
  }, [markersData, isDarkMode, t, onHashtagClickFromPopup, onAddToFavorites, isFavorite, filters.radiusOn, filters.radius, searchRadiusCenter, mapSettings.themeColor, mapSettings.showHints]); // MODIFIED: Changed dependency `markersData` to reflect it's now coming from props

  // useEffect для отрисовки загруженного маршрута
  useEffect(() => {
    if (!mapRef.current || !routeData) return;

    // Удаляем старые маршрутные элементы
    mapRef.current.eachLayer((layer: L.Layer) => {
      if ((layer as any).isRouteLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Создаем пунктирную линию маршрута (или из маркеров, если полилинии нет)
    let routePolyline: L.Polyline | null = null;
    let allLatLngs: L.LatLng[] = [];

    const hasPolyline = routeData.polyline && Array.isArray(routeData.polyline) && routeData.polyline.length > 1;
    if (hasPolyline) {
      // Проверяем, что все координаты валидны
      const validPolyline = routeData.polyline.filter(point => 
        Array.isArray(point) && point.length === 2 && 
        typeof point[0] === 'number' && typeof point[1] === 'number' &&
        !isNaN(point[0]) && !isNaN(point[1])
      );
      
      if (validPolyline.length < 2) {
        console.error('Invalid polyline data:', routeData.polyline);
      } else {
        routePolyline = L.polyline(validPolyline, {
          color: '#ff3b3b',
          weight: 4,
          opacity: 0.9,
          dashArray: '12, 12', // Пунктирная линия
          className: 'route-polyline'
        });

        (routePolyline as any).isRouteLayer = true;
        routePolyline.addTo(mapRef.current);

        allLatLngs = validPolyline.map(([lat, lng]) => L.latLng(lat, lng));
      }
    }

    // Фолбэк: если полилинии нет, строим её из маркеров маршрута
    if (!routePolyline && routeData.markers && Array.isArray(routeData.markers) && routeData.markers.length > 1) {
      const fallback = routeData.markers
        .map((m: any) => [Number(m.latitude), Number(m.longitude)] as [number, number])
        .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));
      if (fallback.length > 1) {
        routePolyline = L.polyline(fallback, {
          color: '#ff3b3b',
          weight: 4,
          opacity: 0.9,
          dashArray: '12, 12',
          className: 'route-polyline'
        });
        (routePolyline as any).isRouteLayer = true;
        routePolyline.addTo(mapRef.current);
        allLatLngs = fallback.map(([lat, lng]) => L.latLng(lat, lng));
      }
    }

    // Добавляем стили для маршрутной линии (анимация пунктира)
    const routeStyle = document.createElement('style');
    routeStyle.innerHTML = `
      .route-polyline {
        stroke-dasharray: 12, 12 !important;
        animation: route-dash 2s linear infinite;
      }
      @keyframes route-dash {
        0% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: 24; }
      }
    `;
    document.head.appendChild(routeStyle);

    // Создаем специальные маркеры маршрута
    if (routeData.markers && Array.isArray(routeData.markers)) {
      routeData.markers.forEach((marker: any, index: number) => {
        if (!marker || typeof marker !== 'object') return;
        
        const lat = parseFloat(marker.latitude);
        const lng = parseFloat(marker.longitude);
        
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        // Создаем специальную иконку для маршрутных меток
        const routeIcon = L.divIcon({
          className: 'route-marker-icon',
          html: `
            <div class="route-marker-base">
              <div class="route-marker-number">${index + 1}</div>
              <div class="route-marker-icon-inner">
                <i class="fas fa-route"></i>
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });

        const routeMarker = L.marker([lat, lng], { icon: routeIcon });
        (routeMarker as any).isRouteLayer = true;
        (routeMarker as any).markerData = marker;
        
        if (mapRef.current) {
          routeMarker.addTo(mapRef.current);
        }

        // Добавляем tooltip с информацией о маршруте
        routeMarker.bindTooltip(`
          <div class="route-tooltip">
            <strong>${marker.title}</strong><br>
            <small>Точка ${index + 1} маршрута "${routeData.title}"</small>
          </div>
        `, {
          direction: 'top',
          offset: [0, -10],
          className: 'route-marker-tooltip'
        });
        }
      });
    }

    // Центрируем карту на маршруте/маркерах
    if (mapRef.current && allLatLngs.length > 0) {
      const bounds = L.latLngBounds(allLatLngs);
      mapRef.current.fitBounds(bounds, { padding: [60, 60] });
    }

    // Адаптивная толщина пунктира в зависимости от зума
    let zoomHandler: any;
    if (mapRef.current && routePolyline) {
      const updateStyle = () => {
        const z = mapRef.current!.getZoom();
        // Толще при дальнем масштабе, тоньше при приближении
        const weight = z <= 5 ? 8 : z <= 8 ? 6 : z <= 12 ? 5 : 4;
        routePolyline!.setStyle({ weight });
      };
      updateStyle();
      zoomHandler = () => updateStyle();
      mapRef.current.on('zoomend', zoomHandler);
    }

    // Добавляем стили для маршрутных элементов
    const routeStyles = document.createElement('style');
    routeStyles.innerHTML = `
      .route-marker-icon {
        background: transparent !important;
        border: none !important;
      }
      .route-marker-base {
        position: relative;
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #ff6b35, #f7931e);
        border-radius: 50%;
        border: 3px solid #fff;
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: route-pulse 2s ease-in-out infinite;
      }
      .route-marker-number {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #fff;
        color: #ff6b35;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        border: 2px solid #ff6b35;
      }
      .route-marker-icon-inner {
        color: #fff;
        font-size: 16px;
      }
      @keyframes route-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      .route-tooltip {
        background: #ff6b35 !important;
        color: #fff !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 8px 12px !important;
        font-size: 14px !important;
      }
    `;
    document.head.appendChild(routeStyles);

    return () => {
      // Очистка при размонтировании
      if (mapRef.current) {
        mapRef.current.eachLayer((layer: L.Layer) => {
          if ((layer as any).isRouteLayer) {
            mapRef.current?.removeLayer(layer);
          }
        });
        if (zoomHandler) {
          mapRef.current.off('zoomend', zoomHandler);
        }
      }
      // Удаляем добавленные стили
      const addedStyles = document.querySelectorAll('style');
      addedStyles.forEach(style => {
        if (style.innerHTML.includes('route-marker') || style.innerHTML.includes('route-polyline')) {
          document.head.removeChild(style);
        }
      });
    };
  }, [routeData]);

  // useEffect для отрисовки запрещённых зон
  useEffect(() => {
    if (!mapRef.current) return;

    // Удаляем старые полигоны зон
    mapRef.current.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Polygon && (layer as any).isZoneLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Добавляем новые полигоны зон
    zones.forEach(zone => {
      const color = (zone.severity === 'critical') ? '#EF4444' : 
                   (zone.severity === 'warning') ? '#F59E0B' : '#FB923C';
      
      zone.polygons.forEach(ring => {
        const latLngs = ring.map(([lng, lat]) => [lat, lng] as [number, number]);
        const polygon = L.polygon(latLngs, {
          color: color,
          fillColor: color,
          fillOpacity: 0.2,
          weight: 2,
        });
        
        // Добавляем метку для идентификации
        (polygon as any).isZoneLayer = true;
        
        // Добавляем popup с информацией о зоне
        polygon.bindPopup(`
          <div style="font-family: system-ui;">
            <strong>${zone.name || zone.type || 'Запрещённая зона'}</strong><br/>
            <span style="color: ${color};">●</span> ${zone.severity === 'critical' ? 'Критическая зона' : 
                                                      zone.severity === 'warning' ? 'Предупреждение' : 'Ограниченная зона'}
          </div>
        `);
        
        polygon.addTo(mapRef.current!);
      });
    });
  }, [zones]);

  useEffect(() => {
    if (flyToCoordinates && mapRef.current) {
      mapRef.current.flyTo(flyToCoordinates, mapRef.current.getZoom(), {
        animate: true,
        duration: 1.2,
      });
    }
  }, [flyToCoordinates]);

  useEffect(() => {
    if (
      selectedMarkerIdForPopup &&
      mapRef.current &&
      markerClusterGroupRef.current
    ) {
      const handler = () => {
        markerClusterGroupRef.current!.eachLayer((layer: any) => {
          if (
            layer.markerData &&
            String(layer.markerData.id) === String(selectedMarkerIdForPopup)
          ) {
            // Не открываем Leaflet попап, наш React попап уже открыт
          }
        });
        mapRef.current!.off('moveend', handler);
      };
      mapRef.current!.on('moveend', handler);
    }
  }, [selectedMarkerIdForPopup, markersData]);

  // Обновляем класс selected для всех открытых попапов при изменении selectedMarkerIdForPopup
  useEffect(() => {
    if (markerClusterGroupRef.current) {
      markerClusterGroupRef.current.eachLayer((layer: any) => {
        if (layer.getPopup && layer.getPopup()) {
          const popupElement = layer.getPopup().getElement();
          if (popupElement) {
            const markerId = layer.markerData?.id;
            if (markerId && selectedMarkerIdForPopup === markerId) {
              popupElement.classList.add('selected');
            } else {
              popupElement.classList.remove('selected');
            }
          }
        }
      });
    }
  }, [selectedMarkerIdForPopup]);

  // Радиус поиска — используем themeColor
  useEffect(() => {
    if (!mapRef.current) return;
    let radiusCircle: L.Circle | null = null;

    if (filters.radiusOn) {
      radiusCircle = L.circle(searchRadiusCenter, {
        radius: filters.radius * 1000,
        color: mapSettings.themeColor, // Используем themeColor
        fillColor: mapSettings.themeColor,
        fillOpacity: 0.15,
        weight: 2,
        interactive: true,
      }).addTo(mapRef.current);

      // Позволяем перетаскивать круг
      radiusCircle.on('mousedown', function (_) {
        mapRef.current!.dragging.disable();
        function onMove(ev: any) {
          radiusCircle!.setLatLng(ev.latlng);
        }
        function onUp(ev: any) {
          onSearchRadiusCenterChange([ev.latlng.lat, ev.latlng.lng]);
          mapRef.current!.off('mousemove', onMove);
          mapRef.current!.off('mouseup', onUp);
          mapRef.current!.dragging.enable();
        }
        mapRef.current!.on('mousemove', onMove);
        mapRef.current!.on('mouseup', onUp);
      });
    }

    return () => {
      if (radiusCircle) {
        radiusCircle.remove();
      }
    };
  }, [filters.radiusOn, filters.radius, searchRadiusCenter, mapSettings.themeColor]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const closeMiniPopup = () => setMiniPopup(null);

    map.on('movestart', closeMiniPopup);
    map.on('zoomstart', closeMiniPopup);

    return () => {
      map.off('movestart', closeMiniPopup);
      map.off('zoomstart', closeMiniPopup);
    };
  }, []);

  useEffect(() => {
    if (miniPopup?.marker?.id) {
      lastMiniPopupMarkerId.current = miniPopup.marker.id;
    }
  }, [miniPopup]);

  function latLngToContainerPoint(latlng: L.LatLng): { x: number; y: number } {
    if (!mapRef.current) return { x: 0, y: 0 };
    const point = mapRef.current.latLngToContainerPoint(latlng);
    return { x: point.x, y: point.y };
  }

  return (
    <MapContainer>
      <GlobalLeafletPopupStyles />
      <MapWrapper id="map" style={mapStyle}>
        {/* Кнопка настроек (слева) */}
        {/* Перемещённая кнопка Легенда под кнопку настроек */}
        <div style={{ position: 'absolute', left: 50, top: 100, zIndex: 1300 }}>
          <LegendButton
            onClick={() => setLegendOpen(true)}
            style={{
              // локальная тема для кнопки Легенды (можете менять значения)
              // фон кнопки
              ['--legend-bg' as any]: '#ffffff',
              // цвет иконки (вопрос)
              ['--legend-icon-color' as any]: mapSettings.themeColor,
              // рамка
              ['--legend-border-width' as any]: '2px',
              ['--legend-border-color' as any]: '#8E9093',
              // размер (необязательно)
              ['--legend-size' as any]: '47px',
              color: '#fff'
            }}
          >
            <i className="fas fa-question-circle"></i>
          </LegendButton>
        </div>
        {/* Кнопка избранное (справа) */}
        {/* Контейнер для правых кнопок с flexbox */}
        <div className="page-side-buttons right" style={{ 
          '--right-top': '50%',
          '--right-translateY': '-50%',
          '--right-offset': '16px',
          '--right-gap': '14px',
          '--right-button-size': '47px',
          '--right-button-border-width': '2px',
          '--right-button-border-color': '#8E9093',
          '--right-button-bg': '#ffffff',
        } as React.CSSProperties}>
s          {onFavoritesClick && (
            <FavoritesButtonComponent
              onClick={onFavoritesClick}
              count={favoritesCount || 0}
              iconColor="#EE8E1D"
              borderColor="#8E9093"
              bgColor="#FFFFFF"
            />
          )}
          <AddMarkerButton
            setIsAddingMarkerMode={setIsAddingMarkerMode}
            setMapMessage={setMapMessage}
            isAddingMarkerMode={isAddingMarkerMode}
          />
        </div>
        {coordsForNewMarker && (
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(120px, -50%)', // 120px вправо от центра для позиционирования справа от метки
            display: 'flex', pointerEvents: 'auto',
            zIndex: 1200
          }}>
            <ElegantAccordionForm
              coords={coordsForNewMarker}
              onSubmit={async (data: any) => {
                // Удаляем временную метку при успешном добавлении
                if (mapRef.current && tempMarkerRef.current) {
                  mapRef.current.removeLayer(tempMarkerRef.current);
                  setTempMarker(null);
                }
                // Добавляем координаты к данным формы
                const markerDataWithCoords = {
                  ...data,
                  // coordsForNewMarker хранит [lat, lng]
                  latitude: coordsForNewMarker![0],
                  longitude: coordsForNewMarker![1]
                };
                // Добавляем метку через API
                await handleAddMarker(markerDataWithCoords);
                setCoordsForNewMarker(null);
                setDiscoveredPlace(null);
              }}
              onCancel={() => {
                // Удаляем временную метку при отмене
                if (mapRef.current && tempMarkerRef.current) {
                  mapRef.current.removeLayer(tempMarkerRef.current);
                  setTempMarker(null);
                }
                setCoordsForNewMarker(null);
                setDiscoveredPlace(null);
              }}
              discoveredPlace={discoveredPlace}
            />
          </div>
        )}
        {/* Стандартный попап */}
                {selectedMarkerIdForPopup && (() => {
          const marker = markers.find(m => m.id === selectedMarkerIdForPopup);
          if (!marker) return null;
          
          const markerPosition = latLngToContainerPoint(L.latLng(Number(marker.latitude), Number(marker.longitude)));
          
          return (
            <div
              key={`popup-${selectedMarkerIdForPopup}`}
              style={{
                position: 'absolute',
                left: markerPosition.x,
                top: markerPosition.y,
                transform: 'translate(-50%, -100%)',
                zIndex: 1300, // Увеличиваем z-index для отображения поверх мини-попапов
                width: '205px', // Фиксированная ширина как в Map.styles.ts
                height: '285px', // Фиксированная высота как в Map.styles.ts
              }}
            >
              <MarkerPopup
                marker={marker}
                onClose={() => setSelectedMarkerIdForPopup(null)}
                onHashtagClick={onHashtagClickFromPopup}
                onMarkerUpdate={(updatedMarker) => {
                  setMarkersData((prev: MarkerData[]) => prev.map((m: MarkerData) => m.id === updatedMarker.id ? updatedMarker : m));
                }}
                onAddToFavorites={onAddToFavorites}
                isFavorite={isFavorite(marker)}
                isSelected={!!(selectedMarkerIds?.includes(selectedMarkerIdForPopup))} // Передаём isSelected для горящих рамок
              />
            </div>
          );
        })()}
        {mapMessage && <MapMessage>{mapMessage}</MapMessage>}
        
        {/* Индикатор поиска места */}
        {isDiscoveringPlace && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            minWidth: '200px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #4299e1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{
              color: '#2d3748',
              fontSize: '16px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              🔍 Ищем место...
            </div>
            <div style={{
              color: '#718096',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              Проверяем базы данных и геокодеры
            </div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
        
        {/* Модальное окно подтверждения места удалено - теперь используется интегрированная форма */}
      </MapWrapper>
      {isLoading && (
        <LoadingOverlay>
          <div className="loading-content">
            <div className="spinner" />
            <p>{t('map.loading')}</p>
          </div>
        </LoadingOverlay>
      )}
      {error && (
        <ErrorMessage>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            {t('map.error.retry')}
          </button>
        </ErrorMessage>
      )}
      {legendOpen && (
        <MapLegend
          onClose={() => setLegendOpen(false)}
          mapSettings={mapSettings}
        />
      )}
      {miniPopup && (
        <div
          style={{
            position: 'absolute',
            left: miniPopup.position.x,
            top: miniPopup.position.y,
            zIndex: 1200,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <MiniMarkerPopup
            marker={miniPopup.marker}
            onOpenFull={() => {
              const markerId = lastMiniPopupMarkerId.current;
              setMiniPopup(null);
              if (markerId) {
                setSelectedMarkerIdForPopup(markerId); // Открываем наш React попап
              }
            }}
            isSelected={!!(selectedMarkerIdForPopup && selectedMarkerIdForPopup === miniPopup.marker.id)}
          />
        </div>
      )}
      {/* Рендерим MiniMarkerPopup для всех избранных меток с галочками */}
      {selectedMarkerIds?.map((markerId: string) => {
        const marker = markers?.find(m => m.id === markerId);
        if (!marker) return null;
        
        // Не показываем мини-попап если:
        // 1. Открыт стандартный попап для этой метки
        // 2. Есть активный hover на этой метке
        if (selectedMarkerIdForPopup === markerId || 
            (miniPopup && miniPopup.marker.id === markerId)) {
          return null;
        }

        return (
          <div
            key={`selected-${markerId}`}
            style={{
              position: 'absolute',
              left: latLngToContainerPoint(L.latLng(Number(marker.latitude), Number(marker.longitude))).x,
              top: latLngToContainerPoint(L.latLng(Number(marker.latitude), Number(marker.longitude))).y,
              zIndex: 1199,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <MiniMarkerPopup
              marker={marker}
                          onOpenFull={() => {
              setMiniPopup(null);
              setSelectedMarkerIdForPopup(markerId); // Открываем наш React попап
            }}
              isSelected={true}
            />
          </div>
        );
      })}
      
      {/* Убираем старый код с selectedMarkerIdForPopup для мини-попапов */}
    </MapContainer>
  );
};

// --- Оставляем showTraffic и showBikeLanes как неактивные (заглушки) ---
// Можно добавить в MapLegend или отдельный блок: "Дорожное движение и велодорожки появятся позже"

export default Map;