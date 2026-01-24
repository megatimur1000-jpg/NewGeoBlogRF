/**
 * Динамическая загрузка стилей Leaflet
 * Загружает стили только когда они действительно нужны
 */
let leafletStylesLoaded = false;

export async function loadLeafletStyles(): Promise<void> {
  if (leafletStylesLoaded) {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Проверяем, не загружены ли стили уже
    if (document.querySelector('link[data-leaflet-styles]')) {
      leafletStylesLoaded = true;
      return;
    }

    // Загружаем стили из node_modules (быстрее чем CDN)
    await Promise.all([
      import('leaflet/dist/leaflet.css'),
      import('leaflet.markercluster/dist/MarkerCluster.css'),
      import('leaflet.markercluster/dist/MarkerCluster.Default.css'),
    ]);

    leafletStylesLoaded = true;
  } catch (error) {
    // Игнорируем ошибку загрузки стилей из node_modules
    // Fallback: пробуем загрузить через CDN
    try {
      const styles = [
        { href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', id: 'leaflet-css' },
        { href: 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css', id: 'leaflet-cluster-css' },
        { href: 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css', id: 'leaflet-cluster-default-css' },
      ];

      await Promise.all(
        styles.map(
          (style) =>
            new Promise<void>((resolve, reject) => {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = style.href;
              link.setAttribute('data-leaflet-styles', '1');
              link.onload = () => resolve();
              link.onerror = () => reject(new Error(`Failed to load ${style.href}`));
              document.head.appendChild(link);
            })
        )
      );

      leafletStylesLoaded = true;
    } catch (fallbackError) {
      // Игнорируем ошибку загрузки стилей из CDN
    }
  }
}

