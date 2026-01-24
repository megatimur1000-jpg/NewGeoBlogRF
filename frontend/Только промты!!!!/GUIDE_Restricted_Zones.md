## Гайд: Защищённые и запрещённые зоны (Restricted Zones)

### Цель
Защитить проект от размещения пользовательского контента в чувствительных локациях: военные объекты, аэродромы, тюрьмы, критическая инфраструктура, а также природоохранные территории. Реализуем блокировки/предупреждения на этапе создания меток/маршрутов/событий и показываем слой зон на карте.

### Источники данных
- OpenStreetMap (через Overpass API) — автообновление зон по тегам
- Ручные наборы GeoJSON (кураторные списки, локальные исключения)
- Доп. источники по мере необходимости (авиа/энерго домены)

### Типы и теги (минимальный набор)
- Военные: `landuse=military`, `military=*`, `security=restricted`
- Аэродромы/полосы: `aeroway=aerodrome|runway|heliport`, `aerodrome:type=military`
- Тюрьмы: `amenity=prison`; закрытые зоны: `access=private`
- Природоохрана: `boundary=protected_area`, `protect_class=*`, `leisure=nature_reserve`
- Критическая инфраструктура (избирательно): `power=*`, часть `industrial=*` при `access=private`

### Уровни серьёзности
- critical — строгий запрет (блокировка сохранения)
- restricted — запрет по умолчанию (возможен оспоримый кейс через модерацию)
- warning — предупреждение, разрешить с пометкой

### Схема БД
- Таблица `restricted_zones`
  - `id`, `name`, `type` (enum), `severity` (enum), `source` (osm|manual)
  - `geometry` (Polygon/MultiPolygon, SRID 4326)
  - `bbox` (опц.) для предфильтра, `active` (bool), `metadata` (jsonb), `updated_at`
- Индексы
  - PostGIS: `USING GIST (geometry)`
  - Без PostGIS: хранить `bbox` и предфильтровать по нему

### Импорт/обновление
- Скрипт `backend/scripts/zones/import-osm-zones.js`
  - Overpass-запросы по тегам, тайлинг/региональные границы
  - Нормализация в GeoJSON, дедупликация, маппинг в `type`/`severity`
  - Upsert в `restricted_zones` по устойчивому hash (geom+type+source)
- Ручной импорт (админ): загрузка `.geojson` → валидация → запись
- Периодический апдейт (cron) или кнопка в админке

### API (бэкенд)
- `GET /api/zones/tiles?bbox=` — тайлы/упрощённые полигоны для слоя на карте
- `POST /api/zones/check` — проверка точек/линий на пересечения
  - Body: `{ points?: [lon,lat][], lineString?: [[lon,lat],...] }`
  - Response: список зон `{ id, type, severity, name }`
- `POST /api/zones/import` (admin) — импорт GeoJSON
- `POST /api/zones/reload` (admin) — фоновое обновление из Overpass

### Сервис проверки
- `backend/src/utils/zoneGuard.js`
  - Кэш по bbox (LRU, 10–15 мин)
  - Алгоритм: быстрый bbox-фильтр → точная проверка
    - PostGIS: `ST_Contains/ST_Intersects` с SRID 4326
    - Без PostGIS: `@turf/boolean-point-in-polygon`, `@turf/boolean-intersects`
  - Конфиг маппинга OSM тегов → `type`/`severity`

### Интеграция в существующие флоу
- Перед созданием/обновлением сущностей (метка/маршрут/событие):
  - вызывать `zoneGuard.check(point|line)`
  - `critical/restricted` → 409/422 + код причины; `warning` → 200 + флаг
- Логировать попытки нарушений в активность/модерацию

### Фронтенд
- `src/services/zoneService.ts`: `checkPoint`, `checkRoute`, `getTiles`
- UI:
  - Слой «Запрещённые зоны» (toggle) на карте
  - Инлайн‑валидация при добавлении метки/маршрута, модальные предупреждения
  - «Смещение точки» — эвристический сдвиг за границу полигона

### Модерация/безопасность
- Авто‑репорты на попытки в `critical`
- Rate‑limit/временная блокировка при массовых попытках
- Admin override с обязательной пометкой

### Производительность
- Региональные чанки/предкэш по bbox
- Генерализация геометрии для слоя при большом масштабе
- Желателен PostGIS; fallback — turf + bbox предфильтр

### Инкременты внедрения
1) MVP: таблица + `POST /zones/check` + проверка меток + UI предупреждения
2) Маршруты/линии + слой на карте + интеграция с модерацией
3) Автообновления из Overpass + админ‑панель и политики по типам


