import { useEffect, useState, RefObject } from 'react';

/**
 * Хук для отслеживания видимости элемента
 * Использует IntersectionObserver для определения, когда элемент становится видимым
 */
export function useIsVisible(ref: RefObject<HTMLElement>, options?: IntersectionObserverInit): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      setIsVisible(false);
      return;
    }

    // Проверяем начальное состояние
    const checkInitialVisibility = () => {
      const rect = element.getBoundingClientRect();
      const hasSize = rect.width > 0 && rect.height > 0;
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
      const style = window.getComputedStyle(element);
      const isVisibleStyle = style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
      
      return hasSize && isInViewport && isVisibleStyle;
    };

    // Устанавливаем начальное состояние
    setIsVisible(checkInitialVisibility());

    // Создаем IntersectionObserver для отслеживания изменений
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Элемент видим, если он пересекается с viewport и имеет размеры
          const hasSize = entry.boundingClientRect.width > 0 && entry.boundingClientRect.height > 0;
          setIsVisible(entry.isIntersecting && hasSize);
        });
      },
      {
        threshold: 0.1, // Срабатывает когда 10% элемента видно
        ...options,
      }
    );

    observer.observe(element);

    // Также отслеживаем изменения размеров через ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      const rect = element.getBoundingClientRect();
      const hasSize = rect.width > 0 && rect.height > 0;
      const style = window.getComputedStyle(element);
      const isVisibleStyle = style.visibility !== 'hidden' && style.display !== 'none';
      
      if (hasSize && isVisibleStyle) {
        // Проверяем, виден ли элемент в viewport
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
        setIsVisible(isInViewport);
      } else {
        setIsVisible(false);
      }
    });

    resizeObserver.observe(element);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [ref, options]);

  return isVisible;
}

