# 📱 ПЛАН-ПУТЕВОДИТЕЛЬ: Мобильная версия карт

## 🎯 ЦЕЛИ ИЗМЕНЕНИЙ

1. **Карта занимает весь свободный экран** (выделено красным на скриншоте)
2. **Кнопки быстрого выбора поверх карты** (ActionButtons)
3. **Убрать дублирование кнопки "Избранное"** - оставить только в ActionButtons
4. **Убрать заголовки "Карта"/"Планировщик"** - не нужны в мобильной версии (нижние кнопки показывают активный раздел)
5. **Убрать кнопку "Добавить метку"** - есть в ActionButtons
6. **Кнопка настроек карты по центру сверху**, отступ 3мм от ActionButtons
7. **Поисковая строка рядом с кнопкой настроек** - только для map.tsx и planner.tsx
8. **Меню легенды** - знак вопроса внизу справа, без круга и фона
9. **Для planner.tsx** - кнопка "Создать маршрут" рядом с настройками (опционально)
10. **Применить для обеих страниц**: `Map.tsx` и `Planner.tsx`

---

## 📊 ТЕКУЩАЯ СТРУКТУРА

### Map.tsx
```
MobileLayout
  ├── TopBar (заголовок)
  ├── ActionButtons (кнопки быстрого выбора) ← ЕСТЬ "Избранное"
  ├── main (контент)
  │   └── Map.tsx
  │       ├── map-content-header (заголовок + поиск)
  │       └── map-area
  │           ├── page-side-buttons left (кнопка настроек) ← УБРАТЬ
  │           ├── page-side-buttons right (пусто) ← УБРАТЬ
  │           └── Map component
  │               └── page-side-buttons right (FavoritesButton + AddMarkerButton) ← УБРАТЬ FavoritesButton
  └── BottomNavigation
```

### Planner.tsx
```
MobileLayout
  ├── TopBar (заголовок)
  ├── ActionButtons (кнопки быстрого выбора) ← ЕСТЬ "Избранное"
  ├── main (контент)
  │   └── Planner.tsx
  │       ├── page-side-buttons left (кнопка настроек) ← ПЕРЕМЕСТИТЬ
  │       ├── page-side-buttons right (FavoritesButton) ← УБРАТЬ
  │       ├── StableHeader (заголовок)
  │       └── map-area
  │           └── FacadeMap
  └── BottomNavigation
```

---

## ✅ ЦЕЛЕВАЯ СТРУКТУРА

### Map.tsx и Planner.tsx (одинаково)
```
MobileLayout
  ├── TopBar (заголовок) ← УБРАТЬ для /map и /planner в мобильной версии
  ├── ActionButtons (кнопки быстрого выбора) ← ОСТАВИТЬ (с "Избранное")
  ├── main (контент - ПОЛНАЯ ВЫСОТА)
  │   └── Map.tsx / Planner.tsx
  │       ├── Блок настроек и поиска (по центру сверху, отступ 3мм от ActionButtons)
  │       │   ├── Кнопка настроек (по центру)
  │       │   └── Поисковая строка (рядом с кнопкой настроек)
  │       │   └── [Для planner.tsx] Кнопка "Создать маршрут" (опционально)
  │       ├── map-area (ЗАНИМАЕТ ВЕСЬ ЭКРАН)
  │       │   └── Map component / FacadeMap
  │       └── Меню легенды (знак вопроса внизу справа, без круга и фона)
  └── BottomNavigation
```

---

## 🔧 ДЕТАЛЬНЫЙ ПЛАН ИЗМЕНЕНИЙ

### ЗАДАЧА 1: Карта занимает весь экран

**Файлы:** `frontend/src/pages/Map.tsx`, `frontend/src/pages/Planner.tsx`

**Изменения:**

1. **Убрать `map-content-header`** (заголовок "Карта"/"Планировщик" и поиск) - не нужны в мобильной версии
2. **Убрать `StableHeader`** в Planner.tsx - не нужен в мобильной версии
3. **Изменить структуру контейнеров:**
   - `page-main-panel` → `absolute inset-0` (занимает весь экран)
   - `map-area` → `absolute inset-0` (занимает весь экран)
   - Убрать все отступы и padding

**Код для Map.tsx:**
```tsx
// БЫЛО:
<div className="page-main-panel relative">
  <div className="h-full relative">
    <div className="map-content-container">
      <div className="map-content-header">
        <h1>Карта</h1>
        <input placeholder="Поиск..." />
      </div>
      <div className="map-area">...</div>
    </div>
  </div>
</div>

// СТАНЕТ:
<div className="page-main-panel absolute inset-0">
  {/* Блок настроек и поиска по центру сверху (отступ 3мм от ActionButtons) */}
  <div className="absolute top-[calc(var(--action-buttons-height)+3px)] left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2">
    {/* Кнопка настроек */}
    <button
      onClick={() => setSettingsOpen(true)}
      className="bg-white rounded-full p-3 shadow-lg border-2 border-gray-300"
    >
      <FaCog className="text-gray-600" size={20} />
    </button>
    
    {/* Поисковая строка */}
    <input
      type="text"
      placeholder="Поиск мест или меток..."
      className="bg-white rounded-full px-4 py-2 shadow-lg border-2 border-gray-300 min-w-[200px]"
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
    />
  </div>
  
  {/* Карта занимает весь экран */}
  <div className="map-area absolute inset-0">
    <Map ... />
  </div>
</div>
```

**Код для Planner.tsx:**
```tsx
// БЫЛО:
<div className="page-main-panel relative">
  <div className="h-full relative flex flex-col">
    <div className="map-content-container flex-1 flex flex-col min-h-0">
      <StableHeader />
      <div className="map-area flex-1 min-h-0">...</div>
    </div>
  </div>
</div>

// СТАНЕТ:
<div className="page-main-panel absolute inset-0">
  {/* Блок настроек, поиска и создания маршрута по центру сверху (отступ 3мм от ActionButtons) */}
  <div className="absolute top-[calc(var(--action-buttons-height)+3px)] left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2">
    {/* Кнопка настроек */}
    <button
      onClick={() => setSettingsOpen(true)}
      className="bg-white rounded-full p-3 shadow-lg border-2 border-gray-300"
    >
      <FaCog className="text-gray-600" size={20} />
    </button>
    
    {/* Поисковая строка */}
    <input
      type="text"
      placeholder="Поиск мест или меток..."
      className="bg-white rounded-full px-4 py-2 shadow-lg border-2 border-gray-300 min-w-[200px]"
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
    />
    
    {/* Кнопка "Создать маршрут" (опционально) */}
    <button
      onClick={() => navigate('/planner?newRoute=true')}
      className="bg-white rounded-full p-3 shadow-lg border-2 border-gray-300"
      title="Создать маршрут"
    >
      <Navigation className="text-gray-600" size={20} />
    </button>
  </div>
  
  {/* Карта занимает весь экран */}
  <div className="map-area absolute inset-0">
    <FacadeMap ... />
  </div>
</div>
```

---

### ЗАДАЧА 2: Кнопки быстрого выбора поверх карты

**Файл:** `frontend/src/layouts/MobileLayout.tsx`

**Изменения:**

1. **Изменить позиционирование ActionButtons:**
   - Сделать `position: absolute` или `position: fixed`
   - Расположить поверх контента
   - Добавить `z-index` для отображения поверх карты

**Код:**
```tsx
// БЫЛО:
{showActions && <ActionButtons onFavoritesClick={handleFavoritesClick} />}
<main className="flex-1 overflow-y-auto pb-bottom-nav">
  <Outlet />
</main>

// СТАНЕТ:
<main className="flex-1 overflow-hidden pb-bottom-nav relative">
  <Outlet />
  {/* Кнопки быстрого выбора поверх карты */}
  {showActions && (
    <div className="absolute top-0 left-0 right-0 z-40">
      <ActionButtons onFavoritesClick={handleFavoritesClick} />
    </div>
  )}
</main>
```

**Или альтернатива (если нужно фиксированное позиционирование):**
```tsx
{showActions && (
  <div className="fixed top-[var(--topbar-height)] left-0 right-0 z-40">
    <ActionButtons onFavoritesClick={handleFavoritesClick} />
  </div>
)}
<main className="flex-1 overflow-hidden pb-bottom-nav pt-[var(--action-buttons-height)]">
  <Outlet />
</main>
```

---

### ЗАДАЧА 3: Убрать дублирование кнопки "Избранное"

**Файлы:** 
- `frontend/src/pages/Map.tsx`
- `frontend/src/pages/Planner.tsx`
- `frontend/src/components/Map/Map.tsx`

**Изменения:**

#### 3.1. Map.tsx - убрать кнопку избранного из компонента Map

**Файл:** `frontend/src/components/Map/Map.tsx`

**Найти:**
```tsx
{onFavoritesClick && (
  <FavoritesButtonComponent
    onClick={onFavoritesClick}
    count={favoritesCount || 0}
    ...
  />
)}
```

**Удалить** этот блок из `page-side-buttons right` в компоненте Map.

#### 3.2. Planner.tsx - убрать кнопку избранного справа

**Файл:** `frontend/src/pages/Planner.tsx`

**Найти:**
```tsx
<div className="page-side-buttons right" ...>
  <button
    className="page-side-button right"
    onClick={() => setFavoritesOpen(true)}
    title="Избранное"
  >
    <FivePointStar ... />
  </button>
</div>
```

**Удалить** весь блок `page-side-buttons right` с кнопкой избранного.

#### 3.3. Map.tsx - убрать пустой контейнер правых кнопок

**Файл:** `frontend/src/pages/Map.tsx`

**Найти:**
```tsx
<div className="page-side-buttons right" ...>
  {/* здесь могут быть AddMarkerButton / FavoritesButton, если они есть в Map */}
</div>
```

**Удалить** этот пустой контейнер.

---

### ЗАДАЧА 4: Блок настроек, поиска и создания маршрута по центру сверху

**Файлы:** `frontend/src/pages/Map.tsx`, `frontend/src/pages/Planner.tsx`

**Изменения:**

1. **Убрать кнопку настроек слева** (`page-side-buttons left`)
2. **Убрать заголовок и поиск** (`map-content-header` / `StableHeader`)
3. **Добавить блок по центру сверху** с отступом 3мм от ActionButtons:
   - Кнопка настроек (по центру)
   - Поисковая строка (рядом с кнопкой настроек)
   - [Для planner.tsx] Кнопка "Создать маршрут" (опционально)

**Код для Map.tsx:**
```tsx
// УБРАТЬ:
<div className="page-side-buttons left" ...>
  <button onClick={() => setSettingsOpen(true)}>⚙️</button>
</div>
<div className="map-content-header">...</div>

// ДОБАВИТЬ:
<div className="absolute top-[calc(var(--action-buttons-height)+3px)] left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2">
  {/* Кнопка настроек */}
  <button
    onClick={() => setSettingsOpen(true)}
    className="bg-white rounded-full p-3 shadow-lg border-2 border-gray-300 hover:bg-gray-50"
    title="Настройки карты"
  >
    <FaCog className="text-gray-600" size={20} />
  </button>
  
  {/* Поисковая строка */}
  <input
    type="text"
    placeholder="Поиск мест или меток..."
    className="bg-white rounded-full px-4 py-2 shadow-lg border-2 border-gray-300 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={searchQuery}
    onChange={e => setSearchQuery(e.target.value)}
    onFocus={() => { if(searchQuery.length > 0) setIsDropdownVisible(true); }}
    onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
  />
  
  {/* Выпадающий список результатов поиска */}
  {isDropdownVisible && (
    <SearchResultsDropdown ... />
  )}
</div>
```

**Код для Planner.tsx:**
```tsx
// УБРАТЬ:
<div className="page-side-buttons left" ...>
  <button onClick={() => setSettingsOpen(true)}>⚙️</button>
</div>
<StableHeader />

// ДОБАВИТЬ:
<div className="absolute top-[calc(var(--action-buttons-height)+3px)] left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2">
  {/* Кнопка настроек */}
  <button
    onClick={() => setSettingsOpen(true)}
    className="bg-white rounded-full p-3 shadow-lg border-2 border-gray-300 hover:bg-gray-50"
    title="Настройки карты"
  >
    <FaCog className="text-gray-600" size={20} />
  </button>
  
  {/* Поисковая строка */}
  <input
    type="text"
    placeholder="Поиск мест или меток..."
    className="bg-white rounded-full px-4 py-2 shadow-lg border-2 border-gray-300 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={searchQuery}
    onChange={e => setSearchQuery(e.target.value)}
  />
  
  {/* Кнопка "Создать маршрут" (опционально) */}
  <button
    onClick={() => navigate('/planner?newRoute=true')}
    className="bg-white rounded-full p-3 shadow-lg border-2 border-gray-300 hover:bg-gray-50"
    title="Создать маршрут"
  >
    <Navigation className="text-gray-600" size={20} />
  </button>
</div>
```

**CSS переменная для высоты ActionButtons:**
```css
:root {
  --action-buttons-height: 106px; /* 70px (кнопка) + 24px (padding) + 12px (отступ) */
}
```

---

### ЗАДАЧА 5: Изменение меню легенды

**Файл:** `frontend/src/components/Map/Map.tsx`

**Изменения:**

1. **Изменить `LegendButton`** - убрать круг и фон
2. **Позиционировать внизу справа**
3. **Оставить только знак вопроса**

**Код:**
```tsx
// БЫЛО:
<LegendButton
  className="legend-button"
  onClick={toggleLegend}
  style={{ ... }}
>
  <i className="fas fa-question-circle"></i>
</LegendButton>

// СТАНЕТ:
<button
  className="map-legend-button"
  onClick={toggleLegend}
  style={{
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    zIndex: 40,
    background: 'transparent',
    border: 'none',
    padding: 0,
    fontSize: '24px',
    color: '#6B7280',
    cursor: 'pointer',
  }}
  title="Легенда карты"
>
  <i className="fas fa-question-circle"></i>
</button>
```

**CSS:**
```css
.map-legend-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 40;
  background: transparent;
  border: none;
  padding: 0;
  font-size: 24px;
  color: #6B7280;
  cursor: pointer;
  transition: color 0.2s;
}

.map-legend-button:hover {
  color: #3B82F6;
}
```

---

### ЗАДАЧА 6: Убрать TopBar для карт в мобильной версии

**Файл:** `frontend/src/layouts/MobileLayout.tsx`

**Изменения:**

1. **Скрыть TopBar для `/map` и `/planner`** в мобильной версии
2. **Или сделать условный рендеринг**

**Код:**
```tsx
// БЫЛО:
<TopBar 
  title={title} 
  showSearch={location.pathname === '/posts' || location.pathname === '/'}
  showSettings={location.pathname === '/map' || location.pathname === '/planner'}
  showHelp={true}
  onSettingsClick={handleSettingsClick}
  onFavoritesClick={handleFavoritesClick}
/>

// СТАНЕТ:
{/* Скрываем TopBar для карт в мобильной версии */}
{!['/map', '/planner'].includes(location.pathname) && (
  <TopBar 
    title={title} 
    showSearch={location.pathname === '/posts' || location.pathname === '/'}
    showSettings={false}
    showHelp={true}
    onSettingsClick={handleSettingsClick}
    onFavoritesClick={handleFavoritesClick}
  />
)}
```

---

## 📝 ПОШАГОВЫЙ ПЛАН РЕАЛИЗАЦИИ

### Шаг 1: Подготовка CSS переменных
- [ ] Добавить CSS переменную `--action-buttons-height` в глобальные стили
- [ ] Определить точную высоту ActionButtons (включая padding)

### Шаг 2: Изменение MobileLayout
- [ ] Изменить позиционирование ActionButtons (поверх контента)
- [ ] Убедиться, что ActionButtons имеют правильный z-index

### Шаг 3: Изменение Map.tsx
- [ ] Убрать `map-content-header` или сделать overlay
- [ ] Изменить структуру контейнеров (absolute positioning)
- [ ] Убрать `page-side-buttons left` (кнопка настроек)
- [ ] Убрать пустой `page-side-buttons right`
- [ ] Добавить кнопку настроек по центру сверху
- [ ] Убедиться, что карта занимает весь экран

### Шаг 4: Изменение Planner.tsx
- [ ] Убрать `StableHeader` или сделать overlay
- [ ] Изменить структуру контейнеров (absolute positioning)
- [ ] Убрать `page-side-buttons left` (кнопка настроек)
- [ ] Убрать `page-side-buttons right` (кнопка избранного)
- [ ] Добавить кнопку настроек по центру сверху
- [ ] Убедиться, что карта занимает весь экран

### Шаг 5: Изменение компонента Map.tsx
- [ ] Убрать `FavoritesButtonComponent` из `page-side-buttons right`
- [ ] Убрать `AddMarkerButton` (есть в ActionButtons)
- [ ] Убрать весь блок `page-side-buttons right` в компоненте Map

### Шаг 6: Изменение меню легенды
- [ ] Изменить `LegendButton` - убрать круг и фон
- [ ] Позиционировать внизу справа
- [ ] Оставить только знак вопроса

### Шаг 7: Убрать TopBar для карт в мобильной версии
- [ ] Скрыть TopBar для `/map` и `/planner` в мобильной версии
- [ ] Или сделать условный рендеринг в MobileLayout

### Шаг 8: Тестирование
- [ ] Проверить на мобильных устройствах
- [ ] Проверить на разных размерах экрана
- [ ] Убедиться, что карта занимает весь экран
- [ ] Убедиться, что кнопки видны и работают
- [ ] Убедиться, что нет дублирования кнопки "Избранное"
- [ ] Убедиться, что поиск работает корректно
- [ ] Убедиться, что меню легенды отображается правильно
- [ ] Убедиться, что настройки открываются в аккордеоне

---

## 🎨 СТИЛИ И ПОЗИЦИОНИРОВАНИЕ

### Блок настроек и поиска (по центру сверху, отступ 3мм)
```css
.map-controls-top {
  position: absolute;
  top: calc(var(--action-buttons-height) + 3px); /* 3мм отступ */
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.map-settings-button {
  background: white;
  border-radius: 50%;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid #8E9093;
  transition: all 0.2s;
}

.map-settings-button:hover {
  background: #f9fafb;
  transform: scale(1.05);
}

.map-search-input {
  background: white;
  border-radius: 9999px;
  padding: 8px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid #8E9093;
  min-width: 200px;
  outline: none;
  transition: all 0.2s;
}

.map-search-input:focus {
  border-color: #3B82F6;
  ring: 2px;
  ring-color: #3B82F6;
}
```

### Меню легенды (знак вопроса внизу справа, без круга и фона)
```css
.map-legend-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 40;
  
  /* Только знак вопроса, без круга и фона */
  background: transparent;
  border: none;
  padding: 0;
  font-size: 24px;
  color: #6B7280;
  cursor: pointer;
  transition: color 0.2s;
}

.map-legend-button:hover {
  color: #3B82F6;
}
```

### Карта (полный экран)
```css
.map-fullscreen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
```

### ActionButtons (поверх карты)
```css
.action-buttons-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}
```

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **Z-index порядок:**
   - BottomNavigation: `z-30`
   - ActionButtons: `z-40`
   - Кнопка настроек: `z-50`
   - Модальные окна: `z-100+`

2. **Высота ActionButtons:**
   - Нужно точно измерить высоту (кнопка 70px + padding)
   - Использовать CSS переменную для единообразия

3. **Overlay элементы:**
   - Заголовок и поиск можно сделать overlay поверх карты (если нужны)
   - Или полностью убрать для мобильной версии

4. **Адаптивность:**
   - Убедиться, что изменения работают на всех размерах экрана
   - Проверить на реальных мобильных устройствах

5. **Совместимость:**
   - Изменения только для мобильной версии
   - Десктопная версия не должна пострадать

---

## 📋 ЧЕКЛИСТ ПЕРЕД РЕАЛИЗАЦИЕЙ

- [ ] Понятна структура компонентов
- [ ] Определены все места изменений
- [ ] Подготовлены CSS переменные
- [ ] Подготовлены стили для новых элементов
- [ ] Понятен порядок z-index
- [ ] Подготовлен план тестирования

---

## 🚀 ГОТОВНОСТЬ К РЕАЛИЗАЦИИ

**Статус:** ✅ План готов к реализации

**Время реализации:** ~2-3 часа

**Приоритет:** Высокий

**Зависимости:** Нет

---

## 📝 ДОПОЛНИТЕЛЬНЫЕ ТРЕБОВАНИЯ

### Уточнено:
1. ✅ **Заголовки не нужны** - "Карта"/"Планировщик" убрать (нижние кнопки показывают активный раздел)
2. ✅ **Кнопка "Добавить метку" не нужна** - есть в ActionButtons
3. ✅ **Меню легенды** - знак вопроса внизу справа, без круга и фона
4. ✅ **Отступ между ActionButtons и настройками** - 3мм
5. ✅ **Поисковая строка** - рядом с кнопкой настроек, только для map.tsx и planner.tsx
6. ✅ **Настройки открываются в аккордеоне** - адаптированном под мобильное устройство
7. ✅ **Для planner.tsx** - кнопка "Создать маршрут" рядом с настройками (опционально)
8. ✅ **Остальной поиск по проекту** - не нужен в мобильной версии

### Особенности реализации:
- **Поиск** - умный поиск уже настроен, должен работать и в мобильной версии
- **Настройки** - аккордеон незаменим для мобильной версии, очень помогает
- **Чистота карты** - разгрузить от лишних элементов (кнопки настроек, избранного, создания маршрута)

---

**Дата создания:** 14.11.2025  
**Автор:** AI Assistant  
**Версия:** 1.0


