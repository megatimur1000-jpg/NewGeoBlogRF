import axios from 'axios';

// Vite автоматически подставит сюда ваш ключ из .env.local
const apiKey = import.meta.env.VITE_OPENROUTESERVICE_API_KEY;
const yandexApiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY;

const ORS_API_URL = 'https://api.openrouteservice.org/geocode';
const YANDEX_GEOCODER_URL = 'https://geocode-maps.yandex.ru/1.x/';

// Создадим удобный интерфейс для найденных мест
export interface Place {
  id: string;
  name: string; // "Владимир"
  label: string; // "Владимир, Владимирская область, Россия"
  coordinates: [number, number]; // [широта, долгота] — НОРМАЛИЗОВАНО
  region?: string; // "Владимирская область"
  country?: string; // "Россия"
}

/**
 * Ищет географические места по текстовому запросу через OpenRouteService.
 * @param query Текст для поиска (например, "Владимир")
 * @returns Массив найденных мест
 */
const searchPlacesORS = async (query: string): Promise<Place[]> => {
  if (!apiKey) {
    return [];
  }

  try {
    const response = await axios.get(`${ORS_API_URL}/autocomplete`, {
      params: {
        api_key: apiKey,
        text: query,
        lang: 'ru', // Искать на русском
        layers: 'venue,address,locality,region,country', // Искать дома, улицы, города, регионы, страны
        size: 10, // Увеличиваем количество результатов
        focus_point: 'lon:37.6173,lat:55.7558', // Фокус на Москву для лучших результатов по России
        boundary_country: 'RUS', // Ограничиваем поиск Россией
      },
    });

    if (response.data && response.data.features) {
      // Преобразуем ответ от API в наш удобный формат Place
      const places: Place[] = response.data.features.map((feature: any) => {
        const properties = feature.properties;
        const coords = feature.geometry.coordinates; // ORS: [lon, lat]
        
        // Извлекаем регион из label
        const labelParts = properties.label.split(', ');
        const region = labelParts.length > 1 ? labelParts[1] : undefined;
        const country = labelParts.length > 2 ? labelParts[2] : undefined;
        
        return {
          id: properties.gid,
          name: properties.name,
          label: properties.label,
          coordinates: [coords[1], coords[0]],
          region: region,
          country: country,
        };
      });
      
      // Фильтруем и сортируем результаты
      return places
        .filter(place => {
          // Исключаем результаты с "Московская область" для всех городов
          if (place.region === 'Московская область' && place.name !== query) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          // Приоритет: точное совпадение названия
          const aExact = (a.name || '').toLowerCase() === query.toLowerCase();
          const bExact = (b.name || '').toLowerCase() === query.toLowerCase();
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          return 0;
        })
        .slice(0, 5); // Возвращаем только первые 5 результатов
    }
    return [];
  } catch (error) {
    return [];
  }
};

/**
 * Ищет географические места по текстовому запросу через Yandex Geocoder (fallback).
 * @param query Текст для поиска
 * @returns Массив найденных мест
 */
const searchPlacesYandex = async (query: string): Promise<Place[]> => {
  if (!yandexApiKey) {
    return [];
  }

  try {
    const response = await axios.get(YANDEX_GEOCODER_URL, {
      params: {
        apikey: yandexApiKey,
        format: 'json',
        geocode: query,
        lang: 'ru_RU',
        results: 5,
        kind: 'house', // Ищем дома, улицы, города
      },
    });

    if (response.data && response.data.response && response.data.response.GeoObjectCollection) {
      const features = response.data.response.GeoObjectCollection.featureMember;
      
      const places: Place[] = features.map((feature: any, index: number) => {
        const geoObject = feature.GeoObject;
        const pos = geoObject.Point.pos.split(' ').map(Number); // 'lon lat'
        const [longitude, latitude] = pos;
        
        const name = geoObject.name;
        const description = geoObject.description || '';
        
        return {
          id: `yandex_${index}`,
          name: name,
          label: description || name,
          coordinates: [latitude, longitude],
          region: description.includes(',') ? description.split(',')[1]?.trim() : undefined,
          country: description.includes('Россия') ? 'Россия' : undefined,
        };
      });
      
      return places;
    }
    return [];
  } catch (error) {
    return [];
  }
};

// Кеш для результатов поиска, чтобы избежать повторных запросов
const searchCache = new Map<string, { places: Place[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

/**
 * Ищет географические места по текстовому запросу.
 * Сначала пробует OpenRouteService, затем Yandex Geocoder как fallback.
 * @param query Текст для поиска (например, "Владимир")
 * @returns Массив найденных мест
 */
const searchPlaces = async (query: string): Promise<Place[]> => {
  // Не делаем запрос, если строка слишком короткая
  if (!query || query.trim().length < 2) {
    return [];
  }

  // Проверяем кеш
  const cacheKey = query.toLowerCase().trim();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.places;
  }

  // Сначала пробуем OpenRouteService
  let places = await searchPlacesORS(query);
  
  // Если результатов мало или нет, пробуем Yandex
  if (places.length < 3) {
    const yandexPlaces = await searchPlacesYandex(query);
    
    // Объединяем результаты, избегая дубликатов
    const combinedPlaces = [...places];
    yandexPlaces.forEach(yandexPlace => {
      const isDuplicate = combinedPlaces.some(place => 
        (place.name || '').toLowerCase() === (yandexPlace.name || '').toLowerCase()
      );
      if (!isDuplicate) {
        combinedPlaces.push(yandexPlace);
      }
    });
    
    places = combinedPlaces.slice(0, 5);
  }

  // Дополнительная фильтрация для российских городов
  return places.filter(place => {
    // Исключаем результаты, где все города показываются как "Московская область"
    if (place.region === 'Московская область' && place.name !== query) {
      return false;
    }
    
    // Приоритет российским городам
    if (place.country === 'Россия' || place.label.includes('Россия')) {
      return true;
    }
    
    // Если запрос на русском языке, показываем только российские результаты
    const russianQuery = /[а-яё]/i.test(query);
    if (russianQuery) {
      return place.country === 'Россия' || place.label.includes('Россия');
    }
    
    return true;
  });

  // Сохраняем в кеш
  searchCache.set(cacheKey, { places, timestamp: Date.now() });
  
  // Очищаем старые записи из кеша (если их больше 100)
  if (searchCache.size > 100) {
    const now = Date.now();
    for (const [key, value] of searchCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        searchCache.delete(key);
      }
    }
  }
  
  return places;
};

/**
 * Геокодирует адрес в координаты (прямой геокодинг).
 * Использует Yandex Geocoder для получения координат по адресу.
 * @param address Адрес для геокодирования (например, "Петушки, Владимирская область")
 * @returns Координаты { latitude, longitude } или null
 */
export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    return null;
  }

  if (!yandexApiKey) {
    return null;
  }

  try {
    const response = await axios.get(YANDEX_GEOCODER_URL, {
      params: {
        apikey: yandexApiKey,
        format: 'json',
        geocode: address,
        lang: 'ru_RU',
        results: 1,
      },
    });

    if (response.data?.response?.GeoObjectCollection?.featureMember?.length > 0) {
      const geoObject = response.data.response.GeoObjectCollection.featureMember[0].GeoObject;
      const pos = geoObject.Point.pos.split(' ').map(Number); // 'lon lat'
      const [longitude, latitude] = pos;
      
      return { latitude, longitude };
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

export const geocodingService = {
  searchPlaces,
  searchPlacesORS,
  searchPlacesYandex,
  geocodeAddress,
};
