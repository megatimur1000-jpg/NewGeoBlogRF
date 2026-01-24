Промпт: Рефакторинг картографического фасада в GeoBlog-RF
Цель
Полностью заменить устаревший глобальный объект mapFacade на новый MapContextFacade, обеспечив обратную совместимость для всех компонентов и устранив все архитектурные проблемы.
Текущее состояние

Два фасада: Существует mapFacade (глобальный) и MapContextFacade (новый класс).
Циклические зависимости: Адаптеры (OSMMapRenderer и др.) не могут импортировать интерфейс IMapRenderer из mapFacade.ts.
Несовместимый API: Компоненты ожидают методы (например, addMarker, clear), которые отсутствуют в новом фасаде.
План действий
Фаза 1: Подготовка архитектуры (Выполнено)

Вынести IMapRenderer:

Создать файл src/services/mapFacade/IMapRenderer.ts.
Перенести туда интерфейс IMapRenderer и типы, которые он использует (MapConfig, UnifiedMarker, PersistedRoute, GeoPoint).
Проверка: Убедиться, что все адаптеры импортируют типы из этого нового файла.
Фаза 2: Единая точка входа (Частично выполнено)

Обновить импорты в компонентах:

Во всех компонентах заменить import { MapContextFacade } from '../services/mapFacade'; на import { mapFacade } from '../services/mapFacade/index';.
Файлы: SimplifiedMap.tsx, PostMap.tsx, RegionSelector.tsx, PlannerPage.tsx, Map.tsx.
Исправить реэкспорт в index.tsx:

Убедиться, что index.tsx корректно реэкспортирует mapFacade из mapFacade.ts.
Проверить правильность пути from '../mapFacade'.
Фаза 3: Реализация совместимого API (Текущая фаза)

Реализовать недостающие методы в MapContextFacade:

Добавить методы, которые ожидаются старым кодом, делегируя их в currentRenderer или реализуя вручную:

setCenter(coord: [number, number], zoom?: number): void
addMarker(marker: MapMarker): void (использует renderMarkers)
removeMarker(id: string): void (для совместимости, пока заглушка)
drawRoute(route: Route): void (преобразует в PersistedRoute и вызывает renderRoute)
removeRoute(id: string): void (заглушка)
clear(): void (очищает маркеры)
getBounds(): Bounds | null (заглушка)
getCenter(): [number, number] | null (заглушка)
onClick(handler: (latLng: [number, number]) => void): void
onRouteStats(handler: (stats: RouteStats) => void): void
onRouteGeometry(handler: (coords: Array<[number, number]>) => void): void
fitBounds(bounds: Bounds, padding?: number): void (заглушка)
limitBounds(bounds: Bounds): void (заглушка)
Удалить старые, неиспользуемые методы-заглушки.
Объявить свойства состояния:

В классе MapContextFacade объявить все необходимые свойства:

private trackingActive = false;
private trackingPoints: GeoPoint[] = [];
private trackingStartTime: Date | null = null;
private trackingPaused = false;
private trackingPausedTime = 0;
private geoLocationWatchId: number | null = null;
Фаза 4: Решение оставшихся проблем

Реализовать или удалить устаревшие методы:

Проанализировать вызовы reverseGeocode, getRegionTiles, isRegionDownloaded и т.д.
Либо реализовать их в MapContextFacade, либо удалить из кода, если они больше не нужны.
Настроить API геймификации:

Создать публичные методы в GamificationFacade для recordAction и isActionRateLimited.
Использовать их в mapFacade.ts.
Исправить все пути импорта:

Во всех файлах IMapRenderer.ts, OSMMapRenderer.ts, MarbleGLRenderer.ts и других адаптерах исправить импорт типов на from './IMapRenderer'.
Фаза 5: Финальная проверка и тестирование

Запустить сборку: npm run build
Исправить оставшиеся ошибки: Работать с оставшимися ошибками по группам.
Запустить приложение: Убедиться, что карта и все функции работают в браузере.
