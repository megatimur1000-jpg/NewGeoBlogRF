# 🗺️ АРХИТЕКТУРА ФАСАДА КАРТ (MAP FACADE)

## 📋 ОБЩЕЕ ОПИСАНИЕ

`mapFacade` — единая точка входа для работы с картографическими сервисами в проекте. Фасад абстрагирует работу с разными провайдерами карт (Leaflet, Yandex Maps, MapsGL) и предоставляет единый API.

**Файл:** `frontend/src/services/mapFacade/index.tsx`

---

## 🏗️ АРХИТЕКТУРА

### Структура фасада

```
mapFacade (index.tsx)
├── initializeMap() - инициализация карты
├── getMap() - получение экземпляра карты
├── addMarker() - добавление маркера
├── removeMarker() - удаление маркера
├── drawRoute() - отрисовка маршрута
├── clear() - очистка карты
├── onClick() - подписка на клики
└── [адаптеры]
    ├── leafletAdapter.ts - адаптер для Leaflet
    ├── mapsglAdapter.ts - адаптер для MapsGL
    └── [Yandex Maps через React компонент]
```

### Внутреннее состояние (INTERNAL)

```typescript
INTERNAL: {
  root?: Root | null;           // React root для Yandex Maps
  api?: FacadeApi | null;       // API текущего адаптера
  container?: HTMLElement | null; // DOM контейнер карты
  clickCb?: Function | null;    // Callback для кликов
  routeGeometryCb?: Function | null; // Callback для геометрии маршрута
  routeStatsCb?: Function | null; // Callback для статистики маршрута
  pendingCalls?: Array<Function> | null; // Буферизованные вызовы
}
```

---

## 🔄 ПРОЦЕСС ИНИЦИАЛИЗАЦИИ

### 1. Вызов `mapFacade.initializeMap(container, config)`

**Параметры:**
- `container: HTMLElement` - DOM элемент для карты
- `config: MapConfig` - конфигурация карты

**MapConfig:**
```typescript
{
  provider: 'leaflet' | 'yandex' | 'mapsgl';
  center?: [number, number];  // [lat, lon]
  zoom?: number;
  markers?: MapMarker[];
  routes?: Route[];
}
```

### 2. Выбор провайдера

Фасад проверяет `config.provider` и загружает соответствующий адаптер:

#### Leaflet (`provider: 'leaflet'`)
```typescript
// Динамический импорт адаптера
const mod = await import('./leafletAdapter');
const api = await mod.initializeLeaflet(container, config);
INTERNAL.api = api;
```

**Что делает leafletAdapter:**
1. Загружает Leaflet библиотеку (если не загружена)
2. Создаёт `L.map(container, {...})`
3. **КРИТИЧНО:** Создаёт базовый `tileLayer` (OpenStreetMap) - **БЕЗ НЕГО КАРТА НЕ ОТОБРАЗИТСЯ!**
4. Создаёт группу кластеров маркеров
5. Возвращает `FacadeApi` с методами для работы с картой

#### Yandex Maps (`provider: 'yandex'` или по умолчанию)
```typescript
// Создаёт React компонент через createRoot
const App = createFacadeApp(config, (api) => {
  INTERNAL.api = api;
  resolve();
});
const root = createRoot(container);
root.render(React.createElement(App));
```

#### MapsGL (`provider: 'mapsgl'`)
```typescript
const mod = await import('./mapsglAdapter');
const api = await mod.initializeMapsGL(container, config);
INTERNAL.api = api;
```

### 3. Получение экземпляра карты

После инициализации можно получить прямой доступ к экземпляру карты:

```typescript
const map = mapFacade.getMap();
// Для Leaflet: возвращает L.Map
// Для Yandex: возвращает null (используется React компонент)
// Для MapsGL: возвращает экземпляр MapsGL
```

---

## 📤 КАК ФАСАД ОТДАЁТ ДАННЫЕ

### 1. Метод `getMap()`

**Возвращает:**
- Для Leaflet: `L.Map` - прямой экземпляр Leaflet карты
- Для Yandex: `null` (карта управляется через React компонент)
- Для MapsGL: экземпляр MapsGL карты

**Использование в Map.tsx:**
```typescript
await mapFacade.initializeMap(mapContainer, config);
let map = mapFacade.getMap();
if (!map) {
  // Ждём и пробуем снова
  await new Promise(resolve => setTimeout(resolve, 100));
  map = mapFacade.getMap();
}
// Теперь map - это L.Map, можно работать напрямую
mapRef.current = map;
```

### 2. Буферизация вызовов (pendingCalls)

Если фасад ещё не инициализирован, вызовы буферизуются:

```typescript
mapFacade.addMarker(marker); // Если INTERNAL.api === null
// Вызов сохраняется в INTERNAL.pendingCalls
// После инициализации все вызовы выполняются через flushPending()
```

### 3. Callback'и для событий

```typescript
// Подписка на клики
mapFacade.onClick((coords: [number, number]) => {
  console.log('Клик по карте:', coords);
});

// Подписка на геометрию маршрута (только для Yandex)
mapFacade.onRouteGeometry((coords: Array<[number, number]>) => {
  console.log('Геометрия маршрута:', coords);
});

// Подписка на статистику маршрута (только для Yandex)
mapFacade.onRouteStats((stats) => {
  console.log('Статистика:', stats);
});
```

---

## 🔧 ИСПОЛЬЗОВАНИЕ В КОМПОНЕНТАХ

### Map.tsx (Leaflet)

```typescript
// 1. Инициализация
useEffect(() => {
  const initMap = async () => {
    const mapContainer = mapContainerRef.current || document.getElementById('map');
    const config: MapConfig = {
      provider: 'leaflet',
      center: [55.76, 37.64],
      zoom: 10,
      markers: []
    };
    
    await mapFacade.initializeMap(mapContainer, config);
    const map = mapFacade.getMap(); // Получаем L.Map
    mapRef.current = map;
    
    // Теперь можно работать с картой напрямую
    // (добавлять слои, обработчики событий и т.д.)
  };
  initMap();
}, []);

// 2. Добавление маркеров через фасад
useEffect(() => {
  markers.forEach(marker => {
    mapFacade.addMarker({
      id: marker.id,
      lat: marker.latitude,
      lon: marker.longitude,
      title: marker.title
    });
  });
}, [markers]);
```

### Planner.tsx (Yandex Maps)

```typescript
// Использует FacadeMap компонент, который внутри использует фасад
<FacadeMap
  provider="yandex"
  markers={facadeMarkers}
  routes={facadeRoutes}
  onMapReady={() => setIsMapReady(true)}
  onMapClick={handleMapClick}
/>

// FacadeMap внутри вызывает:
// await mapFacade.initializeMap(container, { provider: 'yandex', ... });
```

---

## ⚠️ КРИТИЧЕСКИЕ МОМЕНТЫ

### 1. Leaflet Adapter ВСЕГДА создаёт tileLayer

**Файл:** `frontend/src/services/mapFacade/leafletAdapter.ts:40-45`

```typescript
// КРИТИЧНО: ВСЕГДА создаем базовый tileLayer (OpenStreetMap по умолчанию)
// Без tileLayer карта не отображается!
const defaultTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
  subdomains: 'abc'
});
defaultTileLayer.addTo(map);
```

**Почему это важно:**
- Без `tileLayer` карта будет пустой (белый экран)
- Map.tsx может заменить этот слой на другой тип карты из настроек
- Но базовый слой должен быть создан обязательно

### 2. Конфликт групп кластеров

**Проблема:**
- `leafletAdapter` создаёт свою группу кластеров
- `Map.tsx` создаёт свою группу кластеров
- Это приводит к конфликту

**Решение в Map.tsx:**
```typescript
// Удаляем группу кластеров, созданную фасадом
map.eachLayer((layer: any) => {
  if (layer && typeof layer.getLayers === 'function' && layer !== markerClusterGroupRef.current) {
    map.removeLayer(layer); // Удаляем группу фасада
  }
});
```

### 3. Ожидание инициализации

**Проблема:** `getMap()` может вернуть `null` сразу после `initializeMap()`

**Решение:**
```typescript
let map = mapFacade.getMap();
if (!map) {
  await new Promise(resolve => setTimeout(resolve, 100));
  map = mapFacade.getMap();
}
```

### 4. Очистка при размонтировании

```typescript
useEffect(() => {
  return () => {
    // Очищаем карту через фасад
    mapFacade.clear();
    mapRef.current = null;
  };
}, []);
```

---

## 🔍 ОТЛАДКА

### Визуальные индикаторы отладки

В development режиме в левом верхнем углу экрана отображается блок с информацией о процессе инициализации:

- `Компонент Map смонтирован` - компонент начал рендериться
- `useEffect вызван` - началась инициализация карты
- `Контейнер: НАЙДЕН/НЕ НАЙДЕН` - поиск DOM элемента
- `Инициализация фасада...` - вызов mapFacade.initializeMap()
- `Фасад инициализирован` - фасад готов
- `getMap(): УСПЕХ/NULL` - получение экземпляра карты
- `Инициализация завершена` - всё готово

Если видите ошибки - они будут показаны в этом блоке.

### Игнорируемые ошибки

**Ошибки расширений браузера (автоматически подавляются):**
```
Unchecked runtime.lastError: A listener indicated an asynchronous response...
Uncaught (in promise) Error: A listener indicated an asynchronous response...
```

Эти ошибки возникают из-за расширений браузера (например, блокировщики рекламы) и не влияют на работу приложения. **Они автоматически подавляются глобальными обработчиками в `main.tsx`**, поэтому не будут отображаться в консоли браузера.

### Проверка состояния фасада

```typescript
// Проверка, инициализирован ли фасад
const api = (mapFacade as any).INTERNAL?.api;
console.log('API фасада:', api ? 'инициализирован' : 'не инициализирован');
```

### Проверка контейнера

```typescript
const container = mapContainerRef.current || document.getElementById('map');
console.log('Контейнер карты:', container ? 'найден' : 'НЕ НАЙДЕН');
if (container) {
  console.log('Размеры контейнера:', {
    width: container.offsetWidth,
    height: container.offsetHeight
  });
}
```

---

## 📝 ЧЕКЛИСТ ПРОВЕРКИ

При проблемах с инициализацией карты проверьте:

- [ ] Контейнер карты существует в DOM (`#map` или `mapContainerRef.current`)
- [ ] Контейнер имеет размеры (width > 0, height > 0)
- [ ] `mapFacade.initializeMap()` вызван с правильными параметрами
- [ ] `config.provider` установлен правильно ('leaflet', 'yandex', 'mapsgl')
- [ ] После `initializeMap()` вызван `getMap()` и он возвращает не `null`
- [ ] Для Leaflet: `tileLayer` создан и добавлен на карту
- [ ] Нет ошибок в консоли браузера
- [ ] Нет конфликтов с другими инициализациями карты

---

## 🚫 ЧТО НЕ ДЕЛАТЬ

1. **НЕ инициализируйте карту напрямую** (минуя фасад):
   ```typescript
   // ❌ ПЛОХО
   const map = L.map(container);
   
   // ✅ ХОРОШО
   await mapFacade.initializeMap(container, { provider: 'leaflet' });
   const map = mapFacade.getMap();
   ```

2. **НЕ создавайте несколько карт в одном контейнере**:
   ```typescript
   // ❌ ПЛОХО - вызовет конфликт
   await mapFacade.initializeMap(container, config1);
   await mapFacade.initializeMap(container, config2);
   ```

3. **НЕ забывайте очищать карту** при размонтировании компонента

---

**Дата создания:** 15.11.2025  
**Последнее обновление:** 15.11.2025  
**Автор:** AI Assistant

