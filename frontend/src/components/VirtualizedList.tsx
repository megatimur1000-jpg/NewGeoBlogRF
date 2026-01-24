import React, { useState, useRef, useCallback, useMemo } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Вычисляем видимые элементы
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(height / itemHeight) + overscan,
      items.length
    );
    
    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, height, itemHeight, overscan, items.length]);

  // Общая высота списка
  const totalHeight = items.length * itemHeight;

  // Обработчик скролла
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Позиционирование элементов
  const getItemStyle = useCallback((index: number) => ({
    position: 'absolute' as const,
    top: index * itemHeight,
    height: itemHeight,
    width: '100%'
  }), [itemHeight]);

  // Видимые элементы
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => {
      const actualIndex = visibleRange.start + index;
      return (
        <div key={actualIndex} style={getItemStyle(actualIndex)}>
          {renderItem(item, actualIndex)}
        </div>
      );
    });
  }, [items, visibleRange, renderItem, getItemStyle]);

  return (
    <div
      ref={containerRef}
      className={`virtualized-list ${className}`}
      style={{
        height,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
}

export default VirtualizedList;

