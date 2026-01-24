/**
 * Генератор маркеров для всех категорий
 * 
 * Использование:
 * node generate-markers.js
 * 
 * Создаст SVG файлы для всех категорий в формате pin-{category}.svg
 * Затем конвертируйте их в PNG (34x44px) вручную или используйте инструменты типа Inkscape/svgexport
 */

const fs = require('fs');
const path = require('path');

// Маппинг категорий с цветами и FontAwesome иконками
const categories = [
  { key: 'nature', color: '#27ae60', icon: 'leaf' },
  { key: 'restaurant', color: '#8B0000', icon: 'utensils' },
  { key: 'hotel', color: '#8e44ad', icon: 'hotel' },
  { key: 'attraction', color: '#3498db', icon: 'star' },
  { key: 'culture', color: '#f1c40f', icon: 'landmark' },
  { key: 'entertainment', color: '#f39c12', icon: 'gem' },
  { key: 'transport', color: '#16a085', icon: 'bus' },
  { key: 'shopping', color: '#e67e22', icon: 'wallet' },
  { key: 'healthcare', color: '#e74c3c', icon: 'heart' },
  { key: 'education', color: '#3498db', icon: 'users' },
  { key: 'service', color: '#34495e', icon: 'building' },
  { key: 'event', color: '#9b59b6', icon: 'calendar-check' },
  { key: 'blog', color: '#2ecc71', icon: 'pen-nib' },
  { key: 'route', color: '#f39c12', icon: 'route' },
  { key: 'other', color: '#7f8c8d', icon: 'question' },
  { key: 'user', color: '#e67e22', icon: 'map-pin' }, // user_poi использует pin-user.png
];

/**
 * Создаёт более светлый оттенок цвета для градиента
 */
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.floor((255 - (num >> 16)) * percent / 100));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.floor((255 - ((num >> 8) & 0x00FF)) * percent / 100));
  const b = Math.min(255, (num & 0x0000FF) + Math.floor((255 - (num & 0x0000FF)) * percent / 100));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Получает SVG path для FontAwesome иконки
 * Это упрощённые пути для основных иконок
 */
function getIconPath(iconName) {
  const paths = {
    'leaf': 'M17.56 1.54c-3.5 0-6.94 1.82-8.88 5.1a15.4 15.4 0 0 0-1.18 7.18c0 8.5 6.91 15.37 15.42 15.37 8.5 0 15.42-6.87 15.42-15.37 0-2.48-.44-4.86-1.18-7.18-1.94-3.28-5.38-5.1-8.88-5.1zm0 2c2.4 0 4.68 1.18 6.05 3.2a13.36 13.36 0 0 1 1.03 6.23c0 7.37-5.98 13.37-13.33 13.37-7.35 0-13.33-6-13.33-13.37 0-2.15.38-4.21 1.03-6.23 1.37-2.02 3.65-3.2 6.05-3.2zM12.5 11c.28 0 .5.22.5.5v6c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-6c0-.28.22-.5.5-.5zm10 0c.28 0 .5.22.5.5v6c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-6c0-.28.22-.5.5-.5z',
    'utensils': 'M6 2c0 1.1.9 2 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4c1.1 0 2-.9 2-2zm8 0c0 1.1.9 2 2 2v12c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2V4c1.1 0 2-.9 2-2zm-4 6c0 1.1.9 2 2 2v8c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2v-8c1.1 0 2-.9 2-2z',
    'hotel': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    'star': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    'landmark': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    'gem': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    'bus': 'M4 4h16v12H4V4zm2 14v2h2v-2h8v2h2v-2h2V4H2v14h4z',
    'wallet': 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4H4V6h16v2z',
    'heart': 'M22 14C20.5 12 18 12 16.5 14C14 16.5 14 20 16.5 22.5L22 28L27.5 22.5C30 20 30 16.5 27.5 14C26 12 23.5 12 22 14Z',
    'users': 'M16 7a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 14a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm8 0a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm-8 2c-2.21 0-4 1.79-4 4v1h8v-1c0-2.21-1.79-4-4-4zm8 0c-2.21 0-4 1.79-4 4v1h8v-1c0-2.21-1.79-4-4-4z',
    'building': 'M4 2h16v18H4V2zm2 2v14h12V4H6zm2 2h2v2H8V6zm4 0h2v2h-2V6zm4 0h2v2h-2V6zM8 10h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z',
    'calendar-check': 'M12 2v4M12 18v4M4 8h16M4 12h16M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm4 10l2 2 4-4',
    'pen-nib': 'M12 2L8 6l6 6-2 8 8-2-6-6 4-4-6-6z',
    'route': 'M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h16v2H4v-2z',
    'question': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z',
    'map-pin': 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'
  };
  
  // Если пути нет, используем простой круг как fallback
  return paths[iconName] || 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z';
}

/**
 * Генерирует SVG маркер для категории
 */
function generateMarker(category) {
  const darkColor = category.color;
  const lightColor = lightenColor(darkColor, 40); // На 40% светлее для градиента
  const iconPath = getIconPath(category.icon);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="50" height="74" viewBox="-3 -3 50 74" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Градиент: сверху темнее → снизу светлее -->
    <linearGradient id="markerGradient-${category.key}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${darkColor}"/>
      <stop offset="100%" stop-color="${lightColor}"/>
    </linearGradient>
    
    <!-- Тень -->
    <filter id="markerShadow-${category.key}" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <g filter="url(#markerShadow-${category.key})">
    <!-- Капля: плавный переход от круга к бокам -->
    <path d="M22 0 
             C14 0, 0 8, 0 26 
             C0 42, 14 56, 22 68 
             C30 56, 44 42, 44 26 
             C44 8, 30 0, 22 0 Z"
          fill="url(#markerGradient-${category.key})"
          stroke="#000000"
          stroke-width="1"/>
    
    <!-- Белый круг для иконки -->
    <circle cx="22" cy="20" r="14" fill="white"/>
    
    <!-- Иконка категории (FontAwesome SVG path) -->
    <g transform="translate(22, 20)" fill="${darkColor}">
      <path d="${iconPath}" 
            fill="${darkColor}"
            transform="scale(0.7) translate(-12, -12)"
            stroke="none"/>
    </g>
  </g>
</svg>`;
}

// Создаём директорию если её нет
const markersDir = path.join(__dirname, 'markers');
if (!fs.existsSync(markersDir)) {
  fs.mkdirSync(markersDir, { recursive: true });
}

// Генерируем маркеры для всех категорий
categories.forEach(category => {
  const fileName = category.key === 'user' ? 'pin-user.svg' : `pin-${category.key}.svg`;
  const filePath = path.join(markersDir, fileName);
  const svg = generateMarker(category);
  
  fs.writeFileSync(filePath, svg, 'utf8');
  console.log(`✅ Создан: ${fileName}`);
});

console.log(`\n🎨 Создано ${categories.length} SVG маркеров!`);
console.log(`\n📝 Следующие шаги:`);
console.log(`1. Проверьте SVG файлы в frontend/public/markers/`);
console.log(`2. Конвертируйте их в PNG (34x44px) используя:`);
console.log(`   - Inkscape: inkscape --export-filename=pin-{category}.png --export-width=34 --export-height=44 pin-{category}.svg`);
console.log(`   - Online: https://svgtopng.com/`);
console.log(`   - Или любой другой SVG→PNG конвертер`);

