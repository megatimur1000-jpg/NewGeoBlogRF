import type { Map as LeafletMap } from 'leaflet';


// Заглушка для ленивой Yandex-обёртки (если используется)
export const LazyYandexMap: any = undefined;

// Инициализация Leaflet (shim) — при реальной реализации замените на настоящую
export async function initializeLeaflet(container: HTMLElement, config?: any): Promise<{ map?: LeafletMap | null } | null> {
  // Если на странице есть глобальный L — пробуем инициализировать минимально
  const L = (globalThis as any).L;
  if (!L || !container) {
    return null;
  }
  try {
    const map = L.map(container, {
      center: config?.center ?? [55.75, 37.61],
      zoom: typeof config?.zoom === 'number' ? config.zoom : 6
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    return { map };
  } catch {
    return null;
  }
}

// Экспорт дефолтного shim-адаптера
const leafletAdapterShim = {
  initializeLeaflet,
  LazyYandexMap
};

export default leafletAdapterShim;
