import type { IMapRenderer, MapConfig, UnifiedMarker, PersistedRoute, GeoPoint } from '../IMapRenderer';
import { yandexMapsService } from '../../yandexMapsService';

export class YandexPlannerRenderer implements IMapRenderer {
  private map: any = null;
  private markersCollection: any = null;
  private routeObject: any = null;
  private routeGeometryHandler: ((coords: Array<[number, number]>) => void) | null = null;
  private clickHandlers: Array<(coords: [number, number]) => void> = [];

  async init(containerId: string | HTMLElement, config?: MapConfig): Promise<any> {
    // Ensure ymaps is loaded
    await yandexMapsService.init();
    const ymaps = (window as any).ymaps;
    const center = (config && config.center && Array.isArray(config.center)) ? (config.center as [number, number]) : [55.7558, 37.6176];
    const zoom = config?.zoom ?? 10;

    // Получаем контейнер - может быть строкой (ID) или HTMLElement
    let container: HTMLElement | string;
    if (typeof containerId === 'string') {
      container = containerId;
    } else if (containerId instanceof HTMLElement) {
      // Если передан HTMLElement, используем его ID или создаем временный ID
      if (!containerId.id) {
        containerId.id = `yandex-map-${Date.now()}`;
      }
      container = containerId.id;
    } else {
      throw new Error('Invalid container: must be string ID or HTMLElement');
    }

    // Ждем, пока контейнер будет иметь валидные размеры
    const containerEl = typeof container === 'string' ? document.getElementById(container) : container;
    if (containerEl) {
      let attempts = 0;
      while ((containerEl.offsetWidth === 0 || containerEl.offsetHeight === 0) && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
    }

    // КРИТИЧНО: Если в контейнере уже есть старая карта - уничтожаем её перед созданием новой
    if (containerEl && (containerEl as any).__yandexMap) {
      try {
        (containerEl as any).__yandexMap.destroy();
      } catch (e) {
        // ignore
      }
    }

    // Create map instance
    this.map = new ymaps.Map(container, { center, zoom });
    // Сохраняем ссылку на карту для последующей проверки
    if (containerEl) {
      (containerEl as any).__yandexMap = this.map;
    }

    this.markersCollection = new ymaps.GeoObjectCollection();
    this.map.geoObjects.add(this.markersCollection);

    // Обработка изменения размеров контейнера
    if (containerEl) {
      const resizeObserver = new ResizeObserver(() => {
        if (this.map) {
          try {
            this.map.container.fitToViewport();
          } catch (e) {
            // Игнорируем ошибки при изменении размеров
          }
        }
      });
      resizeObserver.observe(containerEl);
      // Сохраняем observer для очистки при destroy
      (this as any).resizeObserver = resizeObserver;
    }

    // If config contains initial markers, render them
    try {
      if (config && Array.isArray((config as any).markers) && (config as any).markers.length > 0) {
        this.renderMarkers((config as any).markers.map((m: any) => ({
          id: m.id || crypto.randomUUID(),
          coordinates: { lat: m.lat ?? m.latitude, lon: m.lon ?? m.longitude },
          title: m.title || m.name
        })));
      }
    } catch (e) { /* ignore */ }

    // Attach a single click listener that forwards to stored handlers
    try {
      this.map.events.add('click', (e: any) => {
        const c = e.get('coords');
        if (c && Array.isArray(c)) {
          this.clickHandlers.forEach(h => {
            try { h([c[0], c[1]]); } catch (err) { /* ignore */ }
          });
        }
      });
    } catch (e) { /* ignore */ }

    // Return minimal API so facade can expose it via INTERNAL.api
    const api = {
      map: this.map,
      clear: this.clear.bind(this),
      renderMarkers: this.renderMarkers.bind(this),
      renderRoute: this.renderRoute.bind(this),
      onClick: this.onClick.bind(this),
      onRouteGeometry: (h: (coords: Array<[number, number]>) => void) => { this.routeGeometryHandler = h; },
      // Методы для двухоконного режима
      setMapMargin: this.setMapMargin.bind(this),
      resetMapMargin: this.resetMapMargin.bind(this),
    };

    return api;
  }

  renderMarkers(markers: UnifiedMarker[]): void {
    if (!this.map) return;
    try {
      this.markersCollection.removeAll();
      markers.forEach(m => {
        const lat = (m.coordinates && (m.coordinates as any).lat) ?? (m as any).lat;
        const lon = (m.coordinates && (m.coordinates as any).lon) ?? (m as any).lon;
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
        const placemark = new (window as any).ymaps.Placemark([lat, lon], { balloonContent: m.title || '' });
        this.markersCollection.add(placemark);
      });
    } catch (e) {
      // ignore
    }
  }

  renderRoute(route: PersistedRoute): void {
    if (!this.map) return;
    try {
      if (this.routeObject) {
        this.map.geoObjects.remove(this.routeObject);
        this.routeObject = null;
      }

      // Try different shapes of route data
      let coords: Array<[number, number]> = [];
      if (route.geometry && Array.isArray(route.geometry)) {
        coords = route.geometry as Array<[number, number]>;
      } else if (route.waypoints && Array.isArray(route.waypoints)) {
        coords = route.waypoints.map((w: any) => [w.lat, w.lon]);
      } else if ((route as any).points && Array.isArray((route as any).points)) {
        coords = (route as any).points.map((p: any) => Array.isArray(p) ? [p[0], p[1]] : [p.lat, p.lon]);
      }

      if (!coords || coords.length < 2) return;

      this.routeObject = new (window as any).ymaps.Polyline(coords, {}, { strokeWidth: 4, strokeColor: '#2196F3' });
      this.map.geoObjects.add(this.routeObject);

      // Notify route geometry handlers if any
      if (this.routeGeometryHandler) {
        try { this.routeGeometryHandler(coords); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      // ignore
    }
  }

  setView(center: GeoPoint, zoom: number): void {
    if (!this.map) return;
    try { this.map.setCenter([center.lat, center.lon], zoom); } catch (e) { /* ignore */ }
  }

  /**
   * Устанавливает margin для двухоконного режима
   * В двухоконном режиме правая панель занимает 50% экрана,
   * поэтому добавляем отступ справа, чтобы центр карты был в центре левой половины
   * @param rightMargin - отступ справа в пикселях (обычно 50% ширины экрана)
   */
  setMapMargin(rightMargin: number): void {
    if (!this.map) return;
    try {
      // Yandex Maps margin: [top, right, bottom, left]
      this.map.margin.setDefaultMargin([0, rightMargin, 0, 0]);
    } catch (e) {
      // Игнорируем ошибки - margin может не поддерживаться в некоторых версиях
      console.warn('[YandexPlannerRenderer] Failed to set map margin:', e);
    }
  }

  /**
   * Сбрасывает margin карты
   */
  resetMapMargin(): void {
    if (!this.map) return;
    try {
      this.map.margin.setDefaultMargin([0, 0, 0, 0]);
    } catch (e) {
      // ignore
    }
  }

  clear(): void {
    if (!this.map) return;
    try { this.map.geoObjects.removeAll(); } catch (e) { /* ignore */ }
  }

  destroy(): void {
    try {
      // Очищаем ResizeObserver если был создан
      const resizeObserver = (this as any).resizeObserver;
      if (resizeObserver) {
        resizeObserver.disconnect();
        (this as any).resizeObserver = null;
      }
      if (this.map) {
        // Очищаем ссылку из контейнера перед уничтожением
        const container = this.map.container.getElement();
        if (container && (container as any).__yandexMap) {
          delete (container as any).__yandexMap;
        }
        this.map.destroy();
      }
    } catch (e) { /* ignore */ }
    this.map = null;
    this.markersCollection = null;
    this.routeObject = null;
  }

  onClick(handler: (coords: [number, number]) => void): void {
    // Save handler and attach when map is ready (or invoke immediately if ready)
    this.clickHandlers.push(handler);
    if (this.map) {
      // no-op: event listener already routes to clickHandlers
    }
  }

  onRouteGeometry(handler: (coords: Array<[number, number]>) => void): void {
    this.routeGeometryHandler = handler;
  }

  async planRoute(waypoints: GeoPoint[]): Promise<PersistedRoute> {
    // Use yandexMapsService to build a route via provider
    try {
      const coords = waypoints.map(w => [w.lat, w.lon] as [number, number]);
      const geometry = await yandexMapsService.getRoute(coords);
      return { id: `yandex-${Date.now()}`, waypoints, geometry } as PersistedRoute;
    } catch (e) {
      return { id: `yandex-${Date.now()}`, waypoints, geometry: null } as PersistedRoute;
    }
  }
}
