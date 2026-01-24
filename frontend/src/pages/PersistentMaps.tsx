import React from 'react';

// КРИТИЧНО: PersistentMaps больше НЕ рендерит Map/Planner напрямую
// Map и Planner теперь рендерятся через PageLayer на основе store
// Этот компонент нужен только для совместимости с routes, но ничего не рендерит
// Реальное отображение происходит через MainLayout -> PageLayer -> LazyMap/LazyPlanner
const PersistentMaps: React.FC = () => {
  // ВАЖНО: НЕ рендерим ничего здесь!
  // Map и Planner рендерятся через PageLayer на основе store.leftContent
  // Этот компонент существует только для совместимости с routes
  // Это предотвращает конфликты между рендерингом через routes и через PageLayer
  
  // Пустой компонент - все рендерится через PageLayer
  return null;
};

export default PersistentMaps;


