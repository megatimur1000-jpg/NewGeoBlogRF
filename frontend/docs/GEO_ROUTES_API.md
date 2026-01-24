# GEO Routes API — спецификация

Коротко: API для создания, получения, удаления и экспорта GPS‑треков (маршрутов).

Базовый URL: `{{VITE_API_BASE_URL}}` (см. `.env`)

## Конвенции
- Все запросы и ответы в JSON, кроме endpoint'ов экспорта файлов.
- Валидация координат: `lat` ∈ [-90,90], `lon` ∈ [-180,180].
- Idempotency: поддерживаются `clientId` и HTTP header `Idempotency-Key`.
- Политика приватности: поле `metadata.privacy` = `public`|`private`.

---

## POST /api/routes
Создать маршрут (черновик или публикация в зависимости от `status`).

Request payload example:

```json
{
  "clientId": "local-abc-123",      // опционально, для idempotency и offline
  "metadata": {
    "name": "Утренний маршрут",
    "description": "Пробежка по набережной",
    "tags": ["run","morning"],
    "privacy": "public",
    "device": "android:Pixel5",
    "source": "mobile-app"
  },
  "points": [
    {"lat":55.75,"lon":37.62,"alt":130.5,"ts":"2025-12-28T08:12:34Z"},
    {"lat":55.752,"lon":37.621,"ts":"2025-12-28T08:13:00Z"}
  ],
  "status": "draft" // draft|queued|published
}
```

Response (201):

```json
{
  "id": "server-uuid-123",
  "status": "queued",
  "serverId": "routes-123",
  "createdAt": "2025-12-28T08:15:00Z"
}
```

Errors:
- 400 — invalid payload
- 409 — duplicate (if same clientId already published and dedup detected)
- 401 — unauthorized

---

## GET /api/users/:id/routes
Получить список маршрутов пользователя.

Query params:
- `status` — фильтр (draft|queued|published|failed)
- `page`, `limit` — пагинация

Response example:

```json
{
  "items": [
    {"id":"routes-123","clientId":"local-abc-123","distanceMeters":1200,"status":"published","createdAt":"2025-12-28T08:15:00Z","metadata":{...}},
    ...
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

---

## GET /api/routes/:id
Получить маршрут (geo + metadata).

Response example:

```json
{
  "id":"routes-123",
  "ownerId": 42,
  "status":"published",
  "points": [{"lat":55.75,"lon":37.62,"alt":130.5,"ts":"2025-12-28T08:12:34Z"}, ...],
  "distanceMeters": 1200,
  "durationMs": 600000,
  "bbox": [37.62,55.75,37.63,55.76],
  "metadata": {"name":"Утренний маршрут","privacy":"public"},
  "createdAt":"2025-12-28T08:15:00Z"
}
```

Errors: 404 — not found, 403 — forbidden (если приватный).

---

## DELETE /api/routes/:id
Soft delete маршрута. Возвращает 200 и статус `deleted`.

---

## POST /api/routes/:id/export?format=gpx|kml|geojson
Генерация и скачивание файла маршрута.
- `format` — required: `gpx` | `kml` | `geojson`.
- Query params: `includeElevation` (bool), `includeTimestamps` (bool), `downsampleMeters` (number)

Example request:

POST /api/routes/routes-123/export?format=gpx&includeElevation=true
Headers: `Accept: application/gpx+xml`

Response: файл (content-type по формату). Приложение должно открывать «save as».

Errors:
- 400 — unsupported format/invalid params
- 404 — route not found
- 403 — private route access denied

---

## POST /api/gamification/xp
Используется для начисления XP за маршрут. См. frontend/docs/GAMIFICATION_API.md.

Payload example:

```json
{
  "userId": 42,
  "source": "route",
  "sourceId": "routes-123",
  "amount": 50,
  "metadata": {"distanceMeters":12000}
}
```

---

## Идемпотентность и дедупликация
- Клиент посылает `clientId` при создании маршрута — сервер использует его для дедупликации и связывает с `serverId`.
- Клиент может также передавать заголовок `Idempotency-Key` при запросе upload.

---

## Статусы маршрута (recommended)
- `draft` — локальный черновик
- `queued` — в очереди на загрузку
- `published` — опубликован
- `failed` — загрузка не удалась
- `rejected` — отклонён модерацией

---

## Ошибки и retry
- Сервер возвращает `retryAfter` сек в теле при временных ошибках.
- Клиент использует экспоненциальный backoff и увеличивает `uploadAttempts`.

---

## Примеры client-side flows
1. Offline create -> save to IndexedDB with `clientId` -> push to queue (`status: queued`).
2. Queue job: mark->upload POST /api/routes -> on 201 mark `serverId` and `published`/`queued` -> on success remove from queue.
3. On export: GET /api/routes/:id then POST /api/routes/:id/export?format=... или direct download endpoint.

---

## Рекомендации по полям и валидации
- `points` не должны быть пустыми при попытке `publish`.
- Обрезать/сглаживать точки на клиенте (downsampling) при большом количестве точек > 50k.
- Сохранять `distanceMeters`, `durationMs` и `bbox` на клиенте и на сервере после валидации.

---

## Контакт и дальнейшие шаги
- Для интеграции бэкенда реализовать CRUD и export endpoint с поддержкой idempotency.
- После этого фронтенд: `src/api/routesApi.ts`, `src/services/routeExporters/*`, unit tests и интеграция с `offlineContentQueue.ts`.

