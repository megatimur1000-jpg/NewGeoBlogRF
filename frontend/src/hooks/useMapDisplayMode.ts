import { useMemo } from 'react';
import { useContentStore } from '../stores/contentStore';

/**
 * Определяет режим отображения карты на основе состояния приложения
 */
export const useMapDisplayMode = () => {
  const leftContent = useContentStore((state) => state.leftContent);
  const rightContent = useContentStore((state) => state.rightContent);
  const showBackgroundMap = useContentStore((state) => state.showBackgroundMap);

  return useMemo(() => {
    // Проверяем, активен ли Planner (использует Яндекс карту)
    const isPlannerActive = leftContent === 'planner';
    
    // Проверяем, активна ли карта (использует Leaflet)
    const isMapActive = leftContent === 'map';
    
    // Двухоконный режим - когда открыта правая панель
    const isTwoPanelMode = rightContent !== null;

    // ИСПРАВЛЕНО: Leaflet карта ВСЕГДА видна как декоративный фон
    // Пользователь явно требует: фон статичен, не должен перезагружаться при смене контента
    // showBackgroundMap — единственный способ скрыть фон (через настройки)
    const shouldShowFullscreen = isMapActive || isPlannerActive || showBackgroundMap;

    return {
      // Использовать Leaflet карту (не Яндекс)
      shouldUseLeaflet: !isPlannerActive,
      
      // Показывать карту на полном экране
      shouldShowFullscreen,
      
      // Режимы
      isPlannerActive,
      isMapActive,
      isTwoPanelMode,
      
      // Текущий тип карты
      mapProvider: isPlannerActive ? 'yandex' : 'leaflet',
      
      // Отступы для карты
      mapTop: isTwoPanelMode ? '70px' : '0px', // В двухоконном режиме - отступ под хедер
      
      // Класс для контейнера
      containerClass: isTwoPanelMode 
        ? 'facade-map-root two-panel-mode' 
        : 'facade-map-root',
    };
  }, [leftContent, rightContent, showBackgroundMap]);
}

export default useMapDisplayMode;
