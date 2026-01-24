# 📋 РЕЕСТР КОМПОНЕНТОВ С ВЕСОМ

> **Дата анализа:** 22 января 2026  
> **Проект:** Best_Site (Horizon Explorer)

---

## 🎯 ЛЕГЕНДА

**Влияние (Impact):**
- 🔴 **HIGH** - используется в ≥10 местах
- 🟡 **MEDIUM** - используется в 5-9 местах  
- 🟢 **LOW** - используется в 1-4 местах

**Тип компонента:**
- 🔵 **CORE** - ядро системы (сервисы, фасады)
- 🟣 **STATE** - управление состоянием (контексты, stores)
- 🟠 **API** - коммуникация с backend
- 🟢 **UI** - компоненты интерфейса
- 🟡 **UTIL** - утилиты и хелперы

---

## 📊 РЕЕСТР КОМПОНЕНТОВ

| # | Путь | Тип | Влияние | Зависимости | Дубликаты? | Рекомендация |
|---|------|-----|---------|-------------|------------|--------------|
| **1** | `services/projectManager.ts` | 🔵 CORE | 🔴 HIGH | mapFacade, markerService | ❌ НЕТ | ✅ Оставить |
| **2** | `services/map_facade/index.ts` | 🔵 CORE | 🔴 HIGH | adapters, gamification | ❌ НЕТ | ✅ Оставить |
| **3** | `services/mapFacade.ts` | 🔵 CORE | 🔴 UNUSED | - | 🔴 **ДА** | 🔴 **УДАЛИТЬ** |
| **4** | `mapFacade.ts` (root) | 🔵 CORE | 🔴 UNUSED | - | 🔴 **ДА** | 🔴 **УДАЛИТЬ** |
| **5** | `services/gamificationFacade.ts` | 🔵 CORE | 🟡 MEDIUM | xpService, apiClient | ❌ НЕТ | ✅ Оставить |
| **6** | `services/markerService.ts` | 🟠 API | 🔴 HIGH | apiClient | ❌ НЕТ | ✅ Оставить |
| **7** | `services/routeService.ts` | 🟠 API | 🟡 MEDIUM | apiClient | ❌ НЕТ | ✅ Оставить |
| **8** | `services/blogService.ts` | 🟠 API | 🟡 MEDIUM | apiClient | ❌ НЕТ | ✅ Оставить |
| **9** | `services/postsService.ts` | 🟠 API | 🟡 MEDIUM | apiClient | ❌ НЕТ | ✅ Оставить |
| **10** | `services/eventService.ts` | 🟠 API | 🟡 MEDIUM | apiClient | ❌ НЕТ | ✅ Оставить |
| **11** | `services/activityService.ts` | 🟠 API | 🟢 LOW | apiClient | ❌ НЕТ | ✅ Оставить |
| **12** | `services/geocodingService.ts` | 🟠 API | 🟡 MEDIUM | mapFacade | ❌ НЕТ | ✅ Оставить |
| **13** | `services/routingService.ts` | 🟠 API | 🟡 MEDIUM | apiClient | ❌ НЕТ | ✅ Оставить |
| **14** | `services/moderationService.ts` | 🟠 API | 🟢 LOW | apiClient | ❌ НЕТ | ✅ Оставить |
| **15** | `services/xpService.ts` | 🟠 API | 🟢 LOW | apiClient | ❌ НЕТ | ✅ Оставить |
| **16** | `services/offlineService.ts` | 🔵 CORE | 🟢 LOW | storageService | ❌ НЕТ | ✅ Оставить |
| **17** | `services/storageService.ts` | 🟡 UTIL | 🟡 MEDIUM | localStorage | ❌ НЕТ | ✅ Оставить |
| **18** | `services/offlineContentStorage.ts` | 🔵 CORE | 🟡 MEDIUM | IndexedDB | ❌ НЕТ | ✅ Оставить |
| **19** | `services/offlineContentQueue.ts` | 🔵 CORE | 🟢 LOW | offlineContentStorage | ❌ НЕТ | ✅ Оставить |
| **20** | `contexts/AuthContext.tsx` | 🟣 STATE | 🔴 HIGH | apiClient | ❌ НЕТ | ✅ Оставить |
| **21** | `contexts/LayoutContext.tsx` | 🟣 STATE | 🔴 HIGH | contentStore | ⚠️ **ДА** | ⚠️ Упростить |
| **22** | `contexts/FavoritesContext.tsx` | 🟣 STATE | 🟡 MEDIUM | storageService | ❌ НЕТ | ✅ Оставить |
| **23** | `contexts/GamificationContext.tsx` | 🟣 STATE | 🟡 MEDIUM | gamificationFacade | ❌ НЕТ | ✅ Оставить |
| **24** | `contexts/RoutePlannerContext.tsx` | 🟣 STATE | 🟡 MEDIUM | - | ❌ НЕТ | ✅ Оставить |
| **25** | `contexts/GuestContext.tsx` | 🟣 STATE | 🟢 LOW | - | ❌ НЕТ | ✅ Оставить |
| **26** | `contexts/LoadingContext.tsx` | 🟣 STATE | 🔴 HIGH | - | ❌ НЕТ | ✅ Оставить |
| **27** | `contexts/ThemeContext.tsx` | 🟣 STATE | 🟡 MEDIUM | storageService | ❌ НЕТ | ✅ Оставить |
| **28** | `contexts/SideContentContext.tsx` | 🟣 STATE | 🟢 LOW | - | ❌ НЕТ | ✅ Оставить |
| **29** | `stores/contentStore.ts` | 🟣 STATE | 🔴 HIGH | zustand | ⚠️ **ДА** | ⚠️ Упростить |
| **30** | `stores/regionsStore.ts` | 🟣 STATE | 🟡 MEDIUM | zustand, regionCities | ❌ НЕТ | ✅ Оставить |
| **31** | `stores/eventsStore.ts` | 🟣 STATE | 🟢 LOW | zustand | ❌ НЕТ | ✅ Оставить |
| **32** | `stores/regionCities.ts` | 🟡 UTIL | 🟡 MEDIUM | - | ❌ НЕТ | ✅ Оставить |
| **33** | `pages/Map.tsx` | 🟢 UI | 🔴 HIGH | projectManager | ❌ НЕТ | ⚠️ Упростить (1241 строк) |
| **34** | `pages/Planner.tsx` | 🟢 UI | 🟡 MEDIUM | projectManager | ❌ НЕТ | ✅ Оставить |
| **35** | `pages/Posts.tsx` | 🟢 UI | 🟡 MEDIUM | postsService | ❌ НЕТ | ✅ Оставить |
| **36** | `pages/Profile.tsx` | 🟢 UI | 🟡 MEDIUM | AuthContext | ❌ НЕТ | ✅ Оставить |
| **37** | `components/Map/Map.tsx` | 🟢 UI | 🔴 HIGH | projectManager | ❌ НЕТ | ⚠️ Упростить (5353 строки!) |
| **38** | `components/Sidebar.tsx` | 🟢 UI | 🔴 HIGH | contentStore | ❌ НЕТ | ✅ Оставить |
| **39** | `components/Topbar.tsx` | 🟢 UI | 🔴 HIGH | AuthContext | ❌ НЕТ | ✅ Оставить |
| **40** | `hooks/useLazyMarkers.ts` | 🟡 UTIL | 🟡 MEDIUM | markerService | ❌ НЕТ | ✅ Оставить |
| **41** | `utils/russiaBounds.ts` | 🟡 UTIL | 🟡 MEDIUM | - | ❌ НЕТ | ✅ Оставить |
| **42** | `utils/xpCalculator.ts` | 🟡 UTIL | 🟢 LOW | - | ❌ НЕТ | ✅ Оставить |

---

## 🚨 КРИТИЧЕСКИЕ ПРОБЛЕМЫ

### 🔴 ДУБЛИКАТЫ (необходимо удалить)

| Путь | Оригинал | Причина |
|------|----------|---------|
| `services/mapFacade.ts` | `services/map_facade/index.ts` | Дубликат, не используется |
| `mapFacade.ts` (root) | `services/map_facade/index.ts` | Дубликат, устаревший файл |

**Действия:**
1. 🔴 Удалить `frontend/src/mapFacade.ts`
2. 🔴 Удалить `frontend/src/services/mapFacade.ts`
3. ✅ Обновить все импорты на `services/map_facade/index.ts`

---

### ⚠️ ДУБЛИРОВАНИЕ ЛОГИКИ

| Файл 1 | Файл 2 | Проблема | Решение |
|--------|--------|----------|---------|
| `contexts/LayoutContext.tsx` | `stores/contentStore.ts` | Дублирование логики управления панелями | Использовать только `contentStore` |

**Рекомендация:**
- Убрать `LayoutContext` полностью
- ИЛИ сделать его тонкой оберткой над `contentStore` без дублирования логики

---

## 📊 СТАТИСТИКА ПО ТИПАМ

| Тип компонента | Количество | Средний вес |
|----------------|------------|-------------|
| 🔵 **CORE** (Ядра) | 6 | HIGH |
| 🟣 **STATE** (Состояние) | 12 | MEDIUM-HIGH |
| 🟠 **API** (Сервисы) | 11 | MEDIUM |
| 🟢 **UI** (Компоненты) | 7 | HIGH-MEDIUM |
| 🟡 **UTIL** (Утилиты) | 6 | LOW-MEDIUM |
| **ВСЕГО** | **42** | - |

---

## 🎯 КОМПОНЕНТЫ С ВЫСОКИМ ВЛИЯНИЕМ (≥10 зависимостей)

| # | Компонент | Влияние | Зависимостей | Статус |
|---|-----------|---------|--------------|--------|
| 1 | `services/projectManager.ts` | 🔴 HIGH | 9+ | ✅ OK |
| 2 | `services/map_facade/index.ts` | 🔴 HIGH | 10+ | ✅ OK |
| 3 | `services/markerService.ts` | 🔴 HIGH | 15+ | ✅ OK |
| 4 | `contexts/AuthContext.tsx` | 🔴 HIGH | 20+ | ✅ OK |
| 5 | `contexts/LoadingContext.tsx` | 🔴 HIGH | 15+ | ✅ OK |
| 6 | `stores/contentStore.ts` | 🔴 HIGH | 20+ | ⚠️ Дублирование |
| 7 | `pages/Map.tsx` | 🔴 HIGH | 10+ | ⚠️ Слишком большой |
| 8 | `components/Map/Map.tsx` | 🔴 HIGH | 15+ | 🔴 **5353 строки!** |
| 9 | `components/Sidebar.tsx` | 🔴 HIGH | 12+ | ✅ OK |
| 10 | `components/Topbar.tsx` | 🔴 HIGH | 10+ | ✅ OK |

---

## 🔧 КОМПОНЕНТЫ, ТРЕБУЮЩИЕ РЕФАКТОРИНГА

### 🔴 КРИТИЧНО

**1. `components/Map/Map.tsx` (5353 строки)**
- **Проблема:** Монолитный компонент с множеством ответственностей
- **Решение:** Разбить на:
  - `MapRenderer.tsx` - отрисовка карты
  - `MarkerManager.tsx` - управление маркерами
  - `EventHandlers.tsx` - обработка событий
  - `MapControls.tsx` - UI-контролы

### ⚠️ ВАЖНО

**2. `pages/Map.tsx` (1241 строка)**
- **Проблема:** Слишком много логики в странице
- **Решение:** Вынести логику в хуки:
  - `useMapFilters.ts` - фильтры маркеров
  - `useMapState.ts` - состояние карты
  - `useMapActions.ts` - действия

**3. `contexts/LayoutContext.tsx`**
- **Проблема:** Дублирует `contentStore`
- **Решение:** Убрать контекст или сделать оберткой

---

## ✅ ХОРОШО СПРОЕКТИРОВАННЫЕ КОМПОНЕНТЫ

| Компонент | Почему хорошо |
|-----------|---------------|
| `services/projectManager.ts` | Singleton, чистая архитектура |
| `services/gamificationFacade.ts` | Защита от накруток, валидация |
| `stores/regionsStore.ts` | Zustand + persist, ограничения |
| `services/offlineContentStorage.ts` | IndexedDB, async/await |
| `utils/xpCalculator.ts` | Чистые функции, без side-effects |

---

**Следующий шаг:** Выявление архитектурных нарушений
