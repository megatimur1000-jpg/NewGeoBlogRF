# КРАТКОЕ РУКОВОДСТВО ПО КООРДИНАТАМ

## Проблема решена!

✅ Создана централизованная система работы с координатами
✅ Добавлена документация
✅ Исправлен YandexMap.tsx

## Что делать дальше?

### Для новых функций

При добавлении функционала с координатами:

1. **Импортируйте утилиты:**
```typescript
import { toYandexFormat, fromYandexFormat, validateCoordinates } from '../../utils/coordinateConverter';
```

2. **Используйте функции:**
- При получении координат от Yandex: `fromYandexFormat(coords)`
- При передаче в Yandex: `toYandexFormat(coords)`
- Для проверки: `validateCoordinates(lat, lng)`

### Для исправления существующего кода

Найдите все места, где используются координаты:
- Search: `[lat, lng]` или `[lng, lat]` или `latitude, longitude`
- Files: Все файлы `.tsx` и `.ts`
- Replace: Используйте функции из `coordinateConverter.ts`

## Форматы координат

| Компонент | Формат |
|-----------|--------|
| **Внутренний стандарт** | `[latitude, longitude]` |
| Yandex Maps API | `[longitude, latitude]` |
| Leaflet | `[latitude, longitude]` |
| OpenRouteService | `[longitude, latitude]` |

## Функции конвертации

```typescript
import { 
  toYandexFormat,      // [lat, lng] → [lng, lat] для Yandex
  fromYandexFormat,    // [lng, lat] → [lat, lng] от Yandex
  validateCoordinates, // Проверка корректности
  extractCoordinates    // Извлечение из любого объекта
} from '../utils/coordinateConverter';
```

## Примеры

### YandexMap
```typescript
// При получении клика:
const handleClick = (coords: [number, number]) => {
  const ourCoords = fromYandexFormat(coords); // Yandex → наш формат
  // Используем ourCoords
};

// При создании маркера:
const yandexCoords = toYandexFormat(marker.coordinates); // наш → Yandex
new Placemark(yandexCoords, ...);
```

### Leaflet
```typescript
// Leaflet использует наш формат напрямую
const coords: [number, number] = [lat, lng];
L.marker(coords).addTo(map);
```

## Документация

Полная документация: `frontend/COORDINATE_SYSTEM.md`
Файл утилит: `frontend/src/utils/coordinateConverter.ts`

