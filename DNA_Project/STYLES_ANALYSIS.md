# 🎨 АНАЛИЗ СТИЛЕЙ (STYLE AUDIT)

> **Дата:** 22 января 2026  
> **Версия:** 1.0  
> **Статус:** Черновик (первичная инвентаризация)

---

## 🎯 ЗАЧЕМ ЭТОТ ДОКУМЕНТ

Стили — ключевая причина визуальной нестабильности. Сейчас система стилей смешанная и трудно предсказуемая. Цель — **выявить проблемные зоны, зафиксировать риски и начать безопасную унификацию** без разрушения интерфейса.

---

## ✅ КРАТКИЙ ВЫВОД

В проекте используется **микст из 4 систем стилей**:
1. **Tailwind CSS** (утилиты + @apply)
2. **Глобальные CSS-файлы** (index.css + GlobalStyles + PageLayout)
3. **styled-components** (JS-стили внутри компонентов)
4. **Inline styles** (style={{ ... }})

Это дает скорость, но **ломает единый источник истины** и сильно усложняет поддержку.

---

## 🧭 ГДЕ НАХОДЯТСЯ СТИЛИ (ИНВЕНТАРЬ)

### 1) Глобальные точки входа
- [frontend/src/index.css](../frontend/src/index.css) — основной вход, Tailwind + CSS variables + global rules
- [frontend/src/styles/GlobalStyles.css](../frontend/src/styles/GlobalStyles.css) — главный слой глобальных контейнеров, много !important
- [frontend/src/App.css](../frontend/src/App.css) — остатки шаблонных стилей (Vite)
- [frontend/src/PublicApp.css](../frontend/src/PublicApp.css)

### 2) Слой “styles/”
Папка со стилями, содержащими **отдельные визуальные системы**:
- [frontend/src/styles/EmbossedStyles.css](../frontend/src/styles/EmbossedStyles.css)
- [frontend/src/styles/MapBackground.css](../frontend/src/styles/MapBackground.css)
- [frontend/src/styles/PageLayout.css](../frontend/src/styles/PageLayout.css)
- [frontend/src/styles/ParticleSystem.css](../frontend/src/styles/ParticleSystem.css)
- [frontend/src/styles/custom.css](../frontend/src/styles/custom.css)
- и др.

### 3) Стили страниц (pages)
- [frontend/src/pages/ChatNew.css](../frontend/src/pages/ChatNew.css)
- [frontend/src/pages/ChatPanels.css](../frontend/src/pages/ChatPanels.css)
- [frontend/src/pages/GalaxyPreview.css](../frontend/src/pages/GalaxyPreview.css)

### 4) Стили компонентов
- Map: [frontend/src/components/Map/MapActionButtons.css](../frontend/src/components/Map/MapActionButtons.css), [frontend/src/components/Map/MapFilters.css](../frontend/src/components/Map/MapFilters.css)
- Glass UI: [frontend/src/components/Glass/GlassPanel.css](../frontend/src/components/Glass/GlassPanel.css) и др.
- Calendar: [frontend/src/components/Calendar/CalendarActionButtons.css](../frontend/src/components/Calendar/CalendarActionButtons.css)
- Events: [frontend/src/components/Events/EventDetailPage.css](../frontend/src/components/Events/EventDetailPage.css)
- Regions: [frontend/src/components/Regions/RegionSelector.css](../frontend/src/components/Regions/RegionSelector.css)
- TravelCalendar: [frontend/src/components/TravelCalendar/TravelCalendar.css](../frontend/src/components/TravelCalendar/TravelCalendar.css)

### 5) styled-components (JS стили)
Используется в ключевых блоках:
- [frontend/src/components/Map/Map.tsx](../frontend/src/components/Map/Map.tsx)
- [frontend/src/components/Posts/PostConstructor.tsx](../frontend/src/components/Posts/PostConstructor.tsx)
- [frontend/src/components/Blog/BlogEditor.tsx](../frontend/src/components/Blog/BlogEditor.tsx)
- [frontend/src/components/Achievements/AchievementsDashboard.tsx](../frontend/src/components/Achievements/AchievementsDashboard.tsx)

### 6) Inline styles (style={{ ... }})
Наиболее критичные места:
- [frontend/src/components/Map/Map.tsx](../frontend/src/components/Map/Map.tsx)
- [frontend/src/pages/Map.tsx](../frontend/src/pages/Map.tsx)
- [frontend/src/pages/Planner.tsx](../frontend/src/pages/Planner.tsx)
- [frontend/src/pages/Calendar.tsx](../frontend/src/pages/Calendar.tsx)
- [frontend/src/pages/Posts.tsx](../frontend/src/pages/Posts.tsx)

### 7) Прототипы и нерабочие каталоги
- [frontend/Только промты!!!!](../frontend/Только%20промты!!!!) — прототипы, не участвуют в сборке
- [backend/dist/output.css](../backend/dist/output.css) — сборочный артефакт

---

## ⚠️ ПРОБЛЕМНЫЕ МЕСТА (ПЕРВИЧНЫЙ СПИСОК)

### 🔴 1) Дубли и конфликтующие переменные
В [frontend/src/index.css](../frontend/src/index.css) переменные стекла задаются **дважды** (одни значения перезаписывают другие). Это ломает предсказуемость и усложняет дебаг.

### 🔴 2) Дублирование одинаковых классов
`.page-main-container` определен и в GlobalStyles, и в EmbossedStyles. Поведение зависит от порядка импорта → эффект “ползущих” стилей.

### 🔴 3) Массовое использование `!important`
В [frontend/src/styles/GlobalStyles.css](../frontend/src/styles/GlobalStyles.css) и [frontend/src/styles/EmbossedStyles.css](../frontend/src/styles/EmbossedStyles.css) `!important` применяется повсеместно → невозможно переопределить локально.

### 🔴 4) Смешение систем
Tailwind + CSS + styled-components + inline styles → одно изменение может затронуть 3 слоя сразу.

### 🔴 5) Inline-стили для ключевых компонентов
Особенно в Map/Planner/Calendar/Posts. Трудно унифицировать и тестировать.

### 🔴 6) Tailwind config имеет дубли
В [frontend/tailwind.config.js](../frontend/tailwind.config.js) дважды задан `height` и `boxShadow`. Вторые значения перекрывают первые без предупреждений.

### 🟡 7) Шаблонные стили
[frontend/src/App.css](../frontend/src/App.css) содержит остатки шаблона Vite (logo, read-the-docs) — вероятно, не используются.

---

## 🧩 ЧТО МЕШАЕТ ВИЗУАЛИЗАЦИИ (ПО СУТИ)

1. **Нет единого источника правды для токенов цвета/теней/радиусов.**
2. **Критические контейнеры переопределяются в разных файлах.**
3. **Inline styles делают “невидимыми” глобальные правила.**
4. **Много абсолютных/фиксированных позиций** → ломается адаптивность.

---

## ✅ ПРЕДЛОЖЕНИЕ: БЕЗОПАСНЫЙ ПЛАН УНИФИКАЦИИ

### Этап 0 — инвентаризация (сделано)
- Зафиксировать карту стилей (этот документ).

### Этап 1 — единые токены
Создать единый файл токенов (например: `frontend/src/styles/tokens.css`) и перенести туда:
- Цвета
- Радиусы
- Тени
- Прозрачности
- Glass/Embossed наборы

### Этап 2 — единый слой глобальных контейнеров
- Объединить `.page-main-container`, `.page-container` и другие базовые классы в **один файл**.
- Уменьшить `!important` до минимального уровня.

### Этап 3 — постепенная миграция inline → классы
- Начать с Map и Planner (самые чувствительные)
- Далее Calendar → Posts → Blog

### Этап 4 — контроль качества
- Скриншотные проверки (до/после)
- Временные feature flags для новых стилей

---

## 🧭 ЧТО МОЖНО СДЕЛАТЬ ПРЯМО СЕЙЧАС

1. **Согласовать дизайн‑токены** (цвета, тени, радиусы).
2. **Выбрать “источник правды”**: CSS variables + Tailwind theme.
3. **Создать таблицу соответствий**: старые классы → новые токены.
4. **Постепенно заменять inline стили** на классы/токены.

---

## 🧷 ССЫЛКИ НА КЛЮЧЕВЫЕ ФАЙЛЫ

- [frontend/src/index.css](../frontend/src/index.css)
- [frontend/src/styles/GlobalStyles.css](../frontend/src/styles/GlobalStyles.css)
- [frontend/src/styles/EmbossedStyles.css](../frontend/src/styles/EmbossedStyles.css)
- [frontend/src/styles/custom.css](../frontend/src/styles/custom.css)
- [frontend/tailwind.config.js](../frontend/tailwind.config.js)

---

## 📌 СЛЕДУЮЩИЕ ШАГИ (ПРЕДЛОЖЕНИЕ)

Если подтвердите направление, я могу:
1. Подготовить **единый файл токенов** и карту соответствий.
2. Собрать **полный список inline стилей** по приоритетам.
3. Сделать **первую безопасную унификацию** (без визуального риска).

---

**Создано:** GitHub Copilot  
**Дата:** 22 января 2026
