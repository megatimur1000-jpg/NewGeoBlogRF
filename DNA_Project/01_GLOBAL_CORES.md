# 🌐 ГЛОБАЛЬНЫЕ ЯДРА СИСТЕМЫ

> **Дата анализа:** 22 января 2026  
> **Проект:** Best_Site (Horizon Explorer)  
> **Анализ:** Определение архитектурных ядер с влиянием ≥3 зависимостей

---

## 🔴 КРИТИЧЕСКИЕ ЯДРА (Core Layer 1)

### 1. `frontend/src/services/projectManager.ts`

**🌳 Роль:** Единственная точка входа для управления картой и маркерами (Singleton)

**📊 Влияние:** HIGH (используется в 9+ файлах)

**📥 Зависимости:**
- ← `frontend/src/pages/Map.tsx`
- ← `frontend/src/pages/Planner.tsx`
- ← `frontend/src/pages/Posts.tsx`
- ← `frontend/src/components/Map/Map.tsx`
- ← `frontend/src/hooks/useMapInit.ts`
- ← Еще 4+ файла

**🔌 Расширяемость:**
- ✅ Singleton паттерн - защита от множественных экземпляров
- ✅ Возможность подключения адаптеров через `mapFacade`
- ⚠️ Жесткая зависимость от `markerService` - нет DI

**⚠️ Дубликаты / устаревшие аналоги:**
- ❌ **НЕТ ДУБЛИКАТОВ** - это единственный менеджер проекта

**💡 Рекомендации:**
1. ✅ **Оставить как есть** - хорошая архитектура
2. ⚠️ **Добавить DI** для `markerService` (опционально)
3. ✅ **Документировать** жизненный цикл инициализации

---

### 2. `frontend/src/services/map_facade/index.ts`

**🌳 Роль:** Фасад картографических API с автоматическим выбором провайдера (OSM/Yandex/Offline)

**📊 Влияние:** HIGH (10+ файлов + реэкспорты типов)

**📥 Зависимости:**
- ← `frontend/src/services/projectManager.ts` ✅
- ← `frontend/src/pages/Map.tsx`
- ← `frontend/src/pages/Planner.tsx`
- ← `frontend/src/mapFacade.ts` (дубликат?)
- ← `frontend/src/services/mapProvider.ts`
- ← Еще 5+ файлов

**🔌 Расширяемость:**
- ✅ **Адаптерный паттерн** - легко добавить новые провайдеры карт
- ✅ **Dependency Injection** - передача зависимостей через конструктор
- ✅ **INTERNAL API** для тестирования

**⚠️ Дубликаты / устаревшие аналоги:**
- 🔴 **ДУБЛИКАТ:** `frontend/src/mapFacade.ts` (486 строк)
- 🔴 **ДУБЛИКАТ:** `frontend/src/services/mapFacade.ts` (486 строк)

**💡 Рекомендации:**
1. 🔴 **УДАЛИТЬ** `frontend/src/mapFacade.ts` - устаревший файл вне папки services
2. 🔴 **УДАЛИТЬ** `frontend/src/services/mapFacade.ts` - дубликат index.ts
3. ✅ **Использовать ТОЛЬКО** `frontend/src/services/map_facade/index.ts`
4. ✅ **Обновить все импорты** с `mapFacade.ts` на `map_facade/index.ts`

---

### 3. `frontend/src/services/gamificationFacade.ts`

**🌳 Роль:** Единая точка для системы геймификации с защитой от накруток

**📊 Влияние:** MEDIUM (7 файлов)

**📥 Зависимости:**
- ← `frontend/src/contexts/GamificationContext.tsx`
- ← `frontend/src/services/map_facade/index.ts`
- ← `frontend/src/hooks/useRewards.ts`
- ← `frontend/src/components/Profile/ProfileStats.tsx`
- ← Еще 3 файла

**🔌 Расширяемость:**
- ✅ **Singleton паттерн**
- ✅ **Защита от накруток** - лимиты, проверка модерации
- ✅ **Централизованная валидация** XP

**⚠️ Дубликаты / устаревшие аналоги:**
- ❌ **НЕТ ДУБЛИКАТОВ**

**💡 Рекомендации:**
1. ✅ **Оставить как есть** - хорошая архитектура
2. ⚠️ **Добавить логирование** для отладки лимитов

---

## 🟡 ВАЖНЫЕ ЯДРА (Core Layer 2)

### 4. `frontend/src/contexts/AuthContext.tsx`

**🌳 Роль:** Управление авторизацией и профилем пользователя

**📊 Влияние:** HIGH (20+ файлов - все страницы с авторизацией)

**📥 Зависимости:**
- ← Почти все страницы (`Map`, `Posts`, `Profile`, `Planner`, и т.д.)
- ← Все защищенные компоненты

**🔌 Расширяемость:**
- ✅ **React Context** - стандартный паттерн
- ✅ **Хуки** для удобного доступа
- ⚠️ **Нет автоматического обновления токена**

**⚠️ Дубликаты / устаревшие аналоги:**
- ❌ **НЕТ ДУБЛИКАТОВ**

**💡 Рекомендации:**
1. ⚠️ **Добавить автообновление токена** (refresh token)
2. ✅ **Добавить обработку истечения сессии**

---

### 5. `frontend/src/stores/contentStore.ts`

**🌳 Роль:** Zustand store для управления панелями интерфейса (левая/правая)

**📊 Влияние:** HIGH (20+ файлов)

**📥 Зависимости:**
- ← `frontend/src/contexts/LayoutContext.tsx` (делегирует в store)
- ← `frontend/src/components/Sidebar.tsx`
- ← `frontend/src/components/Topbar.tsx`
- ← Все страницы с панелями

**🔌 Расширяемость:**
- ✅ **Zustand** - минималистичный store
- ✅ **subscribeWithSelector** middleware - оптимизация ререндеров
- ✅ **Типизация ContentType** - ограничение значений

**⚠️ Дубликаты / устаревшие аналоги:**
- ⚠️ **ЧАСТИЧНОЕ ДУБЛИРОВАНИЕ:** `LayoutContext.tsx` дублирует логику contentStore

**💡 Рекомендации:**
1. 🔴 **УПРОСТИТЬ:** Убрать `LayoutContext` - использовать только `contentStore`
2. ✅ **ИЛИ:** Сделать `LayoutContext` тонкой оберткой без дублирования логики

---

### 6. `frontend/src/stores/regionsStore.ts`

**🌳 Роль:** Управление выбором регионов России (максимум 3)

**📊 Влияние:** MEDIUM (6 файлов)

**📥 Зависимости:**
- ← `frontend/src/pages/Map.tsx`
- ← `frontend/src/components/Regions/RegionSelector.tsx`
- ← `frontend/src/components/Regions/DownloadRegionModal.tsx`
- ← Еще 3 файла

**🔌 Расширяемость:**
- ✅ **Zustand + persist middleware** - автосохранение в localStorage
- ✅ **Лимит выбора** (до 3 регионов)
- ✅ **Связь с `regionCities`** - справочник

**⚠️ Дубликаты / устаревшие аналоги:**
- ❌ **НЕТ ДУБЛИКАТОВ**

**💡 Рекомендации:**
1. ✅ **Оставить как есть** - хорошая архитектура
2. ⚠️ **Рассмотреть** объединение регионов и столиц в один массив

---

### 7. `frontend/src/stores/regionCities.ts`

**🌳 Роль:** Справочник столиц регионов России с координатами (93 региона)

**📊 Влияние:** MEDIUM (используется через `regionsStore`)

**📥 Зависимости:**
- ← `frontend/src/stores/regionsStore.ts` ✅

**🔌 Расширяемость:**
- ✅ **Чистые данные** - нет логики
- ✅ **Типизация** - `RegionCity` interface
- ✅ **Утилиты** - `getregioncity`, `getRegionCoordinates`

**⚠️ Дубликаты / устаревшие аналоги:**
- ❌ **НЕТ ДУБЛИКАТОВ**

**💡 Рекомендации:**
1. ✅ **Оставить как есть**
2. ⚠️ **Вынести в `constants/` или `data/`** (опционально)

---

## 🟢 ВСПОМОГАТЕЛЬНЫЕ ЯДРА (Core Layer 3)

### 8. `frontend/src/contexts/FavoritesContext.tsx`

**📊 Влияние:** MEDIUM (10+ файлов)

**💡 Рекомендации:** ✅ Оставить как есть

---

### 9. `frontend/src/contexts/GamificationContext.tsx`

**📊 Влияние:** MEDIUM (10+ файлов)

**💡 Рекомендации:** ✅ Оставить как есть

---

### 10. `frontend/src/contexts/RoutePlannerContext.tsx`

**📊 Влияние:** MEDIUM (5+ файлов)

**💡 Рекомендации:** ✅ Оставить как есть

---

### 11. `frontend/src/stores/eventsStore.ts`

**📊 Влияние:** LOW (3 файла)

**💡 Рекомендации:** ✅ Оставить как есть

---

## 📈 ГРАФ ВЛИЯНИЯ ЯДЕР

```
┌────────────────────────────────────────┐
│  🔴 КРИТИЧЕСКИЕ (Core Layer 1)         │
│  - projectManager (9+ зависимостей)    │
│  - map_facade (10+ зависимостей)       │
│  - gamificationFacade (7 зависимостей) │
└────────────────────────────────────────┘
              ▼
┌────────────────────────────────────────┐
│  🟡 ВАЖНЫЕ (Core Layer 2)               │
│  - AuthContext (20+ зависимостей)      │
│  - contentStore (20+ зависимостей)     │
│  - regionsStore (6 зависимостей)       │
│  - regionCities (справочник)            │
└────────────────────────────────────────┘
              ▼
┌────────────────────────────────────────┐
│  🟢 ВСПОМОГАТЕЛЬНЫЕ (Core Layer 3)      │
│  - FavoritesContext                     │
│  - GamificationContext                  │
│  - RoutePlannerContext                  │
│  - eventsStore                          │
└────────────────────────────────────────┘
```

---

## ⚠️ КРИТИЧЕСКИЕ ПРОБЛЕМЫ

### 🔴 ДУБЛИКАТЫ MAPFACADE

**Файлы-дубликаты:**
1. `frontend/src/mapFacade.ts` (486 строк) ← **УДАЛИТЬ**
2. `frontend/src/services/mapFacade.ts` (486 строк) ← **УДАЛИТЬ**

**Корректный файл:**
- ✅ `frontend/src/services/map_facade/index.ts`

**Действия:**
1. Удалить оба дубликата
2. Обновить все импорты на `map_facade/index.ts`

---

### ⚠️ ДУБЛИРОВАНИЕ ЛОГИКИ

**Проблема:** `LayoutContext.tsx` дублирует логику `contentStore.ts`

**Решение:**
- Убрать `LayoutContext` полностью
- ИЛИ сделать его тонкой оберткой над `contentStore`

---

## 📊 СТАТИСТИКА ЯДЕР

| Тип ядра | Количество | Зависимостей |
|----------|------------|--------------|
| **Критические** | 3 | 26+ |
| **Важные** | 4 | 46+ |
| **Вспомогательные** | 4 | 25+ |
| **ВСЕГО** | **11** | **97+** |

---

**Следующий шаг:** Анализ компонентов UI и сервисов API
