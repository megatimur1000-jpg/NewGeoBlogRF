/**
 * Тестовая страница для проверки офлайн-тайлов.
 *
 * Отображает карту с тайлами из MBTiles файлов.
 * Позволяет переключаться между доступными тайлсетами.
 *
 * URL: /offline-map-test
 */

import React, { useEffect, useRef, useState } from 'react';
import { OfflineOSMRenderer } from '../services/map_facade/adapters/OfflineOSMRenderer';
import type { OfflineMapConfig } from '../services/map_facade/adapters/OfflineOSMRenderer';
import { loadLeafletStyles } from '../utils/loadLeafletStyles';

interface TilesetInfo {
  name: string;
  filename: string;
  sizeMB: number;
  format: string;
  bounds: number[] | null;
  center: number[] | null;
  minzoom: number | null;
  maxzoom: number | null;
  description: string | null;
}

const OfflineMapTest: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<OfflineOSMRenderer | null>(null);

  const [tilesets, setTilesets] = useState<TilesetInfo[]>([]);
  const [activeTileset, setActiveTileset] = useState<string>('test-raster');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tilesetMeta, setTilesetMeta] = useState<any>(null);

  // 1. Загружаем список доступных тайлсетов
  useEffect(() => {
    const loadTilesets = async () => {
      try {
        const res = await fetch('/api/tiles');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTilesets(data.tilesets || []);
        if (data.tilesets?.length > 0) {
          setActiveTileset(data.tilesets[0].name);
        }
      } catch (err: any) {
        setError(`Не удалось загрузить список тайлсетов: ${err.message}`);
      }
    };
    loadTilesets();
  }, []);

  // 2. Инициализируем / переинициализируем карту при смене тайлсета
  useEffect(() => {
    if (!mapContainerRef.current || !activeTileset) return;

    const initMap = async () => {
      setLoading(true);
      setError(null);

      // Загружаем CSS Leaflet перед инициализацией карты
      await loadLeafletStyles();

      // Уничтожаем предыдущий рендерер
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }

      try {
        const renderer = new OfflineOSMRenderer();
        const config: OfflineMapConfig = {
          tileset: activeTileset,
          onlineFallback: true,
          showBoundsOverlay: true,
          zoom: 9,
        };

        await renderer.init('offline-map-container', config);
        rendererRef.current = renderer;

        // Загружаем метаданные
        const metaRes = await fetch(`/api/tiles/${activeTileset}/metadata`);
        if (metaRes.ok) {
          const meta = await metaRes.json();
          setTilesetMeta(meta);
        }
      } catch (err: any) {
        setError(`Ошибка инициализации карты: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    initMap();

    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, [activeTileset]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f172a' }}>
      {/* Заголовок и управление */}
      <div
        style={{
          padding: '16px 24px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          zIndex: 1000,
        }}
      >
        <h1 style={{ color: '#f1f5f9', fontSize: '18px', margin: 0, fontWeight: 600 }}>
          🗺️ Офлайн карты — Тестирование тайлов
        </h1>

        {/* Переключатель тайлсетов */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>Тайлсет:</span>
          {tilesets.map(ts => (
            <button
              key={ts.name}
              onClick={() => setActiveTileset(ts.name)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: activeTileset === ts.name ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.2)',
                background: activeTileset === ts.name ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                color: activeTileset === ts.name ? '#60a5fa' : '#94a3b8',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              {ts.name} ({ts.sizeMB} МБ)
            </button>
          ))}
        </div>

        {/* Статус */}
        {loading && (
          <span style={{ color: '#f59e0b', fontSize: '13px' }}>⏳ Загрузка...</span>
        )}
        {error && (
          <span style={{ color: '#ef4444', fontSize: '13px' }}>❌ {error}</span>
        )}
      </div>

      {/* Панель метаданных */}
      {tilesetMeta && (
        <div
          style={{
            padding: '8px 24px',
            background: 'rgba(30, 41, 59, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            gap: '24px',
            fontSize: '12px',
            color: '#94a3b8',
            flexWrap: 'wrap',
          }}
        >
          <span>📐 Формат: <b style={{ color: '#e2e8f0' }}>{tilesetMeta.format}</b></span>
          <span>🔍 Zoom: <b style={{ color: '#e2e8f0' }}>{tilesetMeta.minzoom} — {tilesetMeta.maxzoom}</b></span>
          {tilesetMeta.bounds && (
            <span>
              📍 Bounds: <b style={{ color: '#e2e8f0' }}>
                [{tilesetMeta.bounds.map((b: number) => b.toFixed(3)).join(', ')}]
              </b>
            </span>
          )}
          {tilesetMeta.description && (
            <span>📝 {tilesetMeta.description}</span>
          )}
        </div>
      )}

      {/* Контейнер карты */}
      <div
        id="offline-map-container"
        ref={mapContainerRef}
        style={{
          flex: 1,
          width: '100%',
          minHeight: '400px',
        }}
      />
    </div>
  );
};

export default OfflineMapTest;
