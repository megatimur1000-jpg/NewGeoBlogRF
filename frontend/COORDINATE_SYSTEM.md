# СИСТЕМА КООРДИНАТ В ПРОЕКТЕ

## ОБЩАЯ ИНФОРМАЦИЯ

В этом проекте координаты хранятся **ВСЕГДА** в формате **[latitude, longitude]** (широта, долгота).

Пример для Москвы: `[55.7558, 37.6173]` (широта 55.7558, долгота 37.6173)

## ВАЖНЫЕ ФАЙЛЫ

1. **`frontend/src/utils/coordinateConverter.ts`** - ВСЕ функции для работы с координатами
2. **`frontend/COORDINATE_SYSTEM.md`** - Этот документ

## ПРАВИЛА РАБОТЫ С КООРДИНАТАМИ

### ✅ ДЕЛАЙТЕ ТАК:

```typescript
import { 
  toYandexFormat, 
  fromYandexFormat, 
  getCoordinatesFromMarkerData,
  validateCoordinates 
} from '../utils/coordinateConverter';

// При получении координат из клика Yandex Map:
const handleMapClick = (coords: [number, number]) => {
  const ourCoords = fromYandexFormat(coords); // Конвертируем [lng, lat] → [lat, lng]
  // Теперь используем ourCoords
};

// При передаче координат в YandexMap:
const yandexCoords = toYandexFormat(marker.coordinates); // Конвертируем [lat, lng] → [lng, lat]

// При валидации:
if (!validateCoordinates(lat, lng)) {
  console.error('Некорректные координаты');
}
```

### ❌ НЕ ДЕЛАЙТЕ ТАК:

```typescript
// Не делайте конвертацию вручную:
const coords = [lat, lng]; // ❌ Плохо
const coords = [lng, lat]; // ❌ Плохо (может работать только в одном месте)

// Не используйте разные форматы в разных местах
// Всегда используйте функции из coordinateConverter.ts
```

## КАРТЫ В ПРОЕКТЕ

### 1. YANDEX MAPS (`YandexMap.tsx`)

- **Формат хранения:** `[latitude, longitude]` (наш стандарт)
- **Формат для API:** `[longitude, latitude]` (Yandex)
- **Конвертация:** Используйте `toYandexFormat()` и `fromYandexFormat()`

**Места использования:**
- `frontend/src/components/YandexMap/YandexMap.tsx`
- `frontend/src/pages/Planner.tsx` (использует YandexMap)

**Примеры:**

```typescript
// При создании Placemark:
const yandexCoords = toYandexFormat([55.7558, 37.6173]);
// Результат: [37.6173, 55.7558]

// При получении координат из события click:
const coords = fromYandexFormat([37.6173, 55.7558]); // Из Yandex
// Результат: [55.7558, 37.6173]

// При создании bounds:
const bounds = toYandexFormat([minLat, minLng], [maxLat, maxLng]);
```

### 2. LEAFLET MAPS (`Map.tsx`)

- **Формат:** `[latitude, longitude]` (тот же, что наш стандарт)
- **Конвертация:** Не нужна, используется наш формат

**Места использования:**
- `frontend/src/components/Map/Map.tsx`
- `frontend/src/pages/Map.tsx` (использует Leaflet)

**Примеры:**

```typescript
// Leaflet использует наш формат напрямую:
const coords: [number, number] = [55.7558, 37.6173];
// Нет конвертации!

// Создание маркера:
L.marker([lat, lng]).addTo(map);
```

### 3. OPENROUTESERVICE (Routing API)

- **Формат хранения:** `[latitude, longitude]` (наш стандарт)
- **Формат для API:** `[longitude, latitude]` (OpenRouteService)
- **Конвертация:** Используйте `toYandexFormat()` (тот же формат)

**Места использования:**
- `frontend/src/services/routingService.ts`
- `frontend/src/pages/Planner.tsx` (построение маршрутов)

**Примеры:**

```typescript
// При запросе к OpenRouteService:
const orsCoords = toYandexFormat([lat, lng]);
// Отправляем [lng, lat]
```

## СТРУКТУРЫ ДАННЫХ

### MarkerData

```typescript
interface MarkerData {
  latitude: number;  // Широта
  longitude: number; // Долгота
  // ... другие поля
}
```

**Использование:**
```typescript
import { getYandexCoordinatesFromMarker } from '../utils/coordinateConverter';

const yandexCoords = getYandexCoordinatesFromMarker(marker);
// Результат: [lng, lat] для Yandex Maps
```

### RoutePoint

```typescript
interface UnifiedRoutePoint {
  coordinates: [number, number]; // [latitude, longitude]
  // ... другие поля
}
```

**Использование:**
```typescript
import { toYandexFormat } from '../utils/coordinateConverter';

const point = routePoints[0];
const yandexCoords = toYandexFormat(point.coordinates);
```

## ТИПИЧНЫЕ ОШИБКИ

### 1. Координаты "за Каспийским морем"

**Причина:** Координаты перевернуты (использованы как [lng, lat] вместо [lat, lng])

**Решение:**
```typescript
// ✅ Используйте автоматическую коррекцию:
import { autoCorrectCoordinates } from '../utils/coordinateConverter';

const correctCoords = autoCorrectCoordinates(lat, lng);
```

### 2. Маркеры не отображаются

**Причина:** Неправильный формат координат для конкретной карты

**Решение:**
```typescript
// ✅ Всегда конвертируйте:
import { toYandexFormat } from '../utils/coordinateConverter';

const yandexCoords = toYandexFormat(ourCoords);
```

### 3. Ошибки валидации

**Причина:** Координаты вне допустимого диапазона

**Решение:**
```typescript
import { validateCoordinates } from '../utils/coordinateConverter';

if (!validateCoordinates(lat, lng)) {
  console.error('Некорректные координаты:', lat, lng);
  return;
}
```

## ЧЕКЛИСТ ДЛЯ НОВЫХ ФУНКЦИЙ

При добавлении нового функционала, работающего с координатами:

1. ✅ Импортируйте функции из `coordinateConverter.ts`
2. ✅ Используйте `validateCoordinates()` для проверки
3. ✅ Используйте правильные функции конвертации:
   - `toYandexFormat()` для Yandex Maps
   - `fromYandexFormat()` при получении данных от Yandex Maps
4. ✅ Документируйте, какой формат используется
5. ✅ Тестируйте на реальных координатах (например, Москва: 55.7558, 37.6173)

## ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ

### Полный пример работы с YandexMap

```typescript
import { toYandexFormat, fromYandexFormat, validateCoordinates } from '../utils/coordinateConverter';

const YandexMap = ({ markers, onMapClick }: Props) => {
  
  const handleMapClick = (coords: [number, number]) => {
    // Yandex возвращает [lng, lat], конвертируем в наш формат
    const ourCoords = fromYandexFormat(coords);
    
    if (!validateCoordinates(ourCoords[0], ourCoords[1])) {
      console.error('Некорректные координаты');
      return;
    }
    
    onMapClick(ourCoords);
  };
  
  const yandexMarkers = markers.map(marker => ({
    id: marker.id,
    // Конвертируем для Yandex Maps
    coordinates: toYandexFormat([marker.latitude, marker.longitude]),
    title: marker.title
  }));
  
  return (
    <YandexMap markers={yandexMarkers} onMapClick={handleMapClick} />
  );
};
```

### Полный пример работы с Leaflet

```typescript
import { validateCoordinates } from '../utils/coordinateConverter';

const LeafletMap = ({ markers }: Props) => {
  
  useEffect(() => {
    markers.forEach(marker => {
      const lat = marker.latitude;
      const lng = marker.longitude;
      
      // Leaflet использует наш формат напрямую
      if (validateCoordinates(lat, lng)) {
        L.marker([lat, lng]).addTo(map);
      }
    });
  }, [markers]);
};
```

## ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **Никогда не меняйте формат координат "на лету"** - всегда используйте функции конвертации
2. **Всегда валидируйте координаты** перед использованием
3. **Используйте автоматическую коррекцию** при получении координат из внешних источников
4. **Документируйте изменения** в этом файле при изменении логики

## КОНТАКТЫ

При возникновении проблем с координатами:
1. Проверьте этот документ
2. Используйте функции из `coordinateConverter.ts`
3. Проверьте console.log для отслеживания координат

