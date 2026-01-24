interface Place {
  name: string;
  coordinates: [number, number];
}

class YandexMapsService {
  private apiKey: string | null = null;
  private isInitialized: boolean = false;

  constructor() {
    const key = import.meta.env.VITE_YANDEX_MAPS_API_KEY;
    if (!key) {
      this.apiKey = null;
    } else {
      this.apiKey = key;
      }
  }

  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const win: any = window as any;
      const ensureReady = () => {
        try {
          win.ymaps.ready(() => resolve());
        } catch (e) {
          reject(e);
        }
      };

      if (win.ymaps && win.ymaps.ready) {
        ensureReady();
        return;
      }

      // Load script once
      const script = document.createElement('script');
      const apiKey = this.apiKey || '';
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
      script.async = true;

      script.onload = () => {
        setTimeout(() => {
          if (win.ymaps && win.ymaps.ready) {
            ensureReady();
            this.isInitialized = true;
          } else {
            reject(new Error('Yandex Maps API loaded but ymaps is unavailable'));
          }
        }, 0);
      };

      script.onerror = (error) => {
        reject(new Error('Failed to load Yandex Maps API script'));
      };

      document.head.appendChild(script);
    });
  }

  async getRoute(points: Array<[number, number]>): Promise<Array<[number, number]>> {
    if (!this.isInitialized) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!window.ymaps || !window.ymaps.multiRouter) {
        reject(new Error('Yandex Maps API не загружен или MultiRoute недоступен'));
        return;
      }

      const referencePoints = points.map(p => [p[0], p[1]] as [number, number]);
      const multiRoute = new window.ymaps.multiRouter.MultiRoute(
        { referencePoints },
        {
          routingMode: 'auto',
          boundsAutoApply: false,
          wayPointDraggable: false,
          viaPointDraggable: false
        }
      );

      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for route'));
      }, 10000);

      multiRoute.model.events.add('requestsuccess', () => {
        clearTimeout(timeout);
        try {
          const active = multiRoute.getActiveRoute();
          const paths = active.getPaths();
          if (paths.getLength() > 0) {
            const path = paths.get(0);
            const segments = path.getSegments() || [];
            const allCoords: Array<[number, number]> = [];
            
            segments.forEach((seg: any) => {
              const coords: number[][] = seg?.geometry?.getCoordinates?.() || [];
              coords.forEach((c: number[]) => {
                if (Array.isArray(c) && c.length >= 2) {
                  const lon = c[0];
                  const lat = c[1];
                  if (Number.isFinite(lon) && Number.isFinite(lat)) {
                    // Normalize to [lat, lon] for consumers (facade/renderers expect [lat, lon])
                    allCoords.push([lat, lon]);
                  }
                }
              });
            });
            
            if (allCoords.length > 1) {
              resolve(allCoords);
            } else {
              reject(new Error('Недостаточно точек в маршруте'));
            }
          } else {
            reject(new Error('Маршрут не найден'));
          }
        } catch (err) {
          reject(err);
        }
      });

      multiRoute.model.events.add('requestfail', () => {
        clearTimeout(timeout);
        reject(new Error('Route request failed'));
      });
    });
  }

  async searchPlaces(query: string, bounds?: [[number, number], [number, number]]): Promise<Place[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const searchControl = new (window as any).ymaps.control.SearchControl({
        options: {
          provider: 'yandex#search',
          boundedBy: bounds,
          strictBounds: !!bounds
        }
      });

      searchControl.search(query)
        .then((res: any) => {
          const geoObjects = res.geoObjects;
          const places: Place[] = [];
          geoObjects.each((obj: any) => {
            const place: Place = {
              name: obj.properties.get('name'),
              coordinates: obj.geometry.getCoordinates()
            };
            places.push(place);
          });
          resolve(places);
        })
        .catch(reject);
    });
  }

  async getPlaceDetails(coordinates: [number, number]): Promise<Place | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      (window as any).ymaps.geocode(`${coordinates[0]},${coordinates[1]}`, {
        results: 1,
        kind: 'house'
      }).then((res: any) => {
        const firstGeoObject = res.geoObjects.get(0);
        if (!firstGeoObject) {
          reject(new Error('Место не найдено'));
          return;
        }
        const details: Place = {
          name: firstGeoObject.properties.get('name'),
          coordinates: firstGeoObject.geometry.getCoordinates() // Yandex Maps возвращает [долгота, широта]
        };
        resolve(details);
      }).catch(reject);
    });
  }

  async searchNearbyOrganizations(
    coordinates: [number, number],
    type: string,
    radius: number = 1000
  ): Promise<Place[]> {
    try {
      await this.init();
      return new Promise((resolve, reject) => {
        const searchControl = new window.ymaps.control.SearchControl({
          options: {
            provider: 'yandex#search',
            boundedBy: this.getBoundsFromPoint(coordinates, radius)
          }
        });

        searchControl.search(type)
          .then((res: any) => {
            const places: Place[] = [];
            res.geoObjects.each((org: any) => {
              const place: Place = {
                name: org.properties.get('name'),
                coordinates: org.geometry.getCoordinates() // Yandex Maps возвращает [долгота, широта]
              };
              places.push(place);
              });
            resolve(places);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    } catch (error) {
      throw error;
    }
  }

  private getBoundsFromPoint(coordinates: [number, number], radius: number): [[number, number], [number, number]] {
    // coordinates приходят в формате [долгота, широта] от Yandex Maps
    const [lon, lat] = coordinates; // Исправлено: [долгота, широта]
    const latRadian = (lat * Math.PI) / 180;
    const degLatKm = 111.32 * 1000; // длина градуса широты в метрах
    const degLonKm = (111.32 * Math.cos(latRadian)) * 1000; // длина градуса долготы в метрах
    const deltaLat = radius / degLatKm;
    const deltaLon = radius / degLonKm;
    return [
      [lon - deltaLon, lat - deltaLat], // [долгота, широта]
      [lon + deltaLon, lat + deltaLat]  // [долгота, широта]
    ];
  }
}

export const yandexMapsService = new YandexMapsService();

// Добавляем типы для глобального объекта ymaps
declare global {
  interface Window {
    ymaps: any;
  }
} 