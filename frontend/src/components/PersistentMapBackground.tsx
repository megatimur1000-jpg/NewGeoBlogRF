import React, { useEffect, useRef } from 'react';
import { projectManager } from '../services/projectManager';
import { useContentStore } from '../stores/contentStore';
import { mapFacade } from '../services/map_facade/index';

const PersistentMapBackground: React.FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const leftContent = useContentStore((s) => s.leftContent);
  // ВАЖНО: Фон только для map, НЕ для planner
  // Planner имеет свою собственную карту через projectManager.initializeMap в компоненте Planner
  // Если инициализировать фон для planner, будет конфликт двух карт
  const isMapOnly = leftContent === 'map';
  const initializedRef = React.useRef(false);

  useEffect(() => {
    let mounted = true;
    if (!ref.current) return () => { mounted = false; };

    const el = ref.current;

    // Инициализируем фон один раз — только когда пользователь открыл карту (map)
    // (чтобы не загружать фон вместе с постами). После первой инициализации
    // он сохраняется и больше не пересоздаётся.
    // Planner имеет свою карту, не используем фон для него
    if (initializedRef.current || !isMapOnly) return () => { mounted = false; };

    const initIfSized = async () => {
      try {
        const hasSize = () => el && el.offsetWidth > 0 && el.offsetHeight > 0 && window.getComputedStyle(el).visibility !== 'hidden' && window.getComputedStyle(el).display !== 'none';

        if (!hasSize()) {
          await new Promise<void>((resolve) => {
            let resolved = false;
            const ro = (window as any).ResizeObserver ? new (window as any).ResizeObserver(() => {
              if (!resolved && hasSize()) {
                resolved = true;
                try { ro.disconnect(); } catch (e) {}
                resolve();
              }
            }) : null;

            if (ro) {
              try { ro.observe(el); } catch (e) { /* ignore */ }
            }

            const to = setTimeout(() => {
              if (!resolved) {
                resolved = true;
                try { ro && ro.disconnect(); } catch (e) {}
                resolve();
              }
            }, 1200);

            if (hasSize()) {
              clearTimeout(to);
              resolved = true;
              try { ro && ro.disconnect(); } catch (e) {}
              resolve();
            }
          });
        }

        if (!mounted) return;

        try {
          const api = await projectManager.initializeMap(el, {
            provider: 'leaflet',
            center: [55.7558, 37.6176],
            zoom: 10,
            markers: [],
            routes: []
          });
          if (api) {
            try { mapFacade().registerBackgroundApi?.(api); } catch (e) { /* ignore */ }
          }
          initializedRef.current = true;
        } catch (err) {
          console.warn('PersistentMapBackground: mapFacade init failed', err);
        }
      } catch (err) {
        // ignore
      }
    };

    initIfSized();

    return () => { mounted = false; };
  }, [isMapOnly]);

  return (
    <div
      ref={ref}
      className="persistent-map-bg"
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        // Показываем фон только для map, скрываем для planner (у него своя карта)
        opacity: isMapOnly ? 1 : (leftContent === 'planner' ? 0 : 0.85),
        transition: 'opacity 300ms ease'
      }}
    />
  );
};

export default PersistentMapBackground;
