# GPS-треки — Handover / TODO и архитектура

Цель файла
- Кратко описать текущее состояние реализации GPS-треков, тестов и геймификации.
- Дать последовательный список следующих шагов, чтобы можно было продолжить работу в новой переписке без лишних вопросов.

Как пользоваться
- Скопируйте этот файл в начало новой переписки и напишите: "Продолжай с шага X".
- Впишите изменения статуса рядом с пунктами TODO по мере выполнения.

Краткий статус (на момент создания)
- Среда: Windows, проект в `d:\Best_Site\frontend`
- Тесты: все frontend тесты проходят локально (Vitest). Текущее покрытие: все утверждённые тесты зелёные.
- Сборка: `npm run build` проходит, есть предупреждения Vite про большие чанки и дублирующиеся dynamic imports.

Что реализовано (high level)
- Запись GPS: UI (кнопка), `MapContextFacade` — start/stop tracking, фильтрация точек, расчёт дистанции/duration, bbox.
- Сохранение: интеграция с `offlineContentStorage` / `offlineContentQueue` (IndexedDB) и офлайн‑очередью.
- Экспорт: GPX / KML / GeoJSON сериализаторы и кнопки экспорта в `ProfileRoutes`.
- UI: страница `ProfileRoutes` (список треков, экспорт, добавить в пост, удалить).
- Интеграция с CreatePostModal: возможность открыть модал с `initialRoute` для прикрепления трека к посту.
- Геймификация: `xpService`, `gamificationFacade` интегрированы; добавлены источники XP для GPS (recorded, long, exported).
- Тесты: unit + UI тесты добавлены — `xpService`, `gamificationFacade`, `gamification.integration`, `ProfileRoutes`, `CreatePostModal` и сериализаторы.

Ключевые файлы (быстрые ссылки)
- `src/services/map_facade/MapContextFacade.ts` — логика трекинга и экспорт.
- `src/services/xpService.ts` — wrapper для начисления XP.
- `src/services/gamificationFacade.ts` — авторитетная логика начислений (cooldown, limits, moderation).
- `src/services/offlineContentStorage.ts` — IndexedDB хранилище офлайн-червовиков.
- `src/services/offlineContentQueue.ts` — очередь загрузки черновиков.
- `src/pages/ProfileRoutes.tsx` — UI списка треков.
- `frontend/docs/GAMIFICATION_API.md` — контракт `/gamification/xp`.

Проблемы, которые были решены
- Приведены в порядок типы геймификации (`src/types/gamification.ts`) — добавлены GPS источники и расширено `metadata`.
- Исправлены несоответствия типов в `IMapRenderer` (bbox nullable, notification/userService добавлены).
- Добавлены stub-методы в `storageService` и `offlineContentQueue` для совместимости и сборки.

План работ / Приоритеты

Приоритет 1 — функциональные и безопасность (сделать первым):
1. Довести покрытие XP: доп. unit‑тесты для `cooldown`, `dailyLimit`, `levelUp` (уже добавлены базовые тесты; можно расширить кейсы). (Файл: `tests/gamificationFacade.edgecases.test.ts`)
2. Модерация и валидация треков: интеграция с бэкендом модерации — серверный эндпоинт проверки треков/контента перед начислением XP и публикой трека (если доступен). Если бэкенд пока не готов — сохранить контракт в `frontend/docs/GAMIFICATION_API.md` и добавлять мок‑интеграционные тесты.
3. Покрыть тестами интеграции: мокать `apiClient` и проверить поведение при 401/500/429 и при успешном ответе (изменение уровня, levelUp флаг).

Приоритет 2 — оптимизация и релиз: (после стабилизации фич)
1. Оптимизация сборки: `vite.config.ts` → `rollupOptions.output.manualChunks` (уже частично настроено). Рефакторинг dynamic imports, чтобы избежать больших initial chunk.
2. Документация: обновить README и `frontend/docs/` (описать feature-flag, migration steps для IndexedDB, API contract и флоу трека).
3. Feature flags: добавить флаги включения GPS и начислений XP для поэтапного релиза.

Конкретные задачи (actionable) — следующий этап
1. Добавить тесты для: cooldown edge (с имитацией времени), предел дневного лимита при разных часовых поясах, негативные случаи API (401, 500, rate limit).
2. Подключить серверную модерацию (если есть адрес): реализовать в `gamificationFacade.checkModeration()` вызов `/moderation/check/:contentId` и обработать ответ; покрыть тестом.
3. Настроить CI: прогон `npm test` и `npm run build` в pipeline; fail build если тесты падают.

Команды для локального старта / проверки
```powershell
cd frontend
npm install
npm run test
npm run build
```

Замечания и рекомендации
- XP — всегда считать сервер авторитетным: фронтенд может предлагать amount/multipliers, но сервер должен валидировать и применять лимиты.
- Idempotency: при отправке `/gamification/xp` отправлять `requestId` или использовать `(userId, source, contentId)` для дедупликации на сервере.
- Миграции: при изменениях типов в IndexedDB — инкрементировать версию DB и писать миграционные шаги в `offlineContentStorage`.

Контрольный чек-лист для передачи (copy/paste в новую переписку)
- [ ] Тесты: `npm run test` — все зелёные
- [ ] Сборка: `npm run build` — сборка успешна
- [ ] API контракт для `/gamification/xp` согласован с бэкендом
- [ ] CI настроен на прогон тестов и сборки

Последняя проверка (что нужно знать новому собеседнику)
- Все изменения по трекингу и XP находятся в `frontend/src/services/*` и `frontend/src/pages/ProfileRoutes.tsx`.
- Для запуска тестов достаточно `npm run test` в папке `frontend`.
- Если потребуется продолжать — пришлите: URL бэкенда для модерации и желаемую политику дедупликации/лимитов.

---
Автор: автоматический хэндовер, создано агентом в процессе разработки GPS-фич.
