const CACHE_NAME = 'horizon-explorer-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

// Ресурсы для предварительного кэширования (только для production)
const STATIC_ASSETS = [
  '/',
  '/index.html'
];

// API эндпоинты для кэширования
const API_ENDPOINTS = [
  '/api/places/reverse',
  '/api/places/nearby',
  '/api/markers',
  '/api/routes'
];

// Установка Service Worker (только для production)
self.addEventListener('install', (event) => {
  // В development режиме не кэшируем ресурсы
  if (self.location.hostname === 'localhost') {
    console.log('🔧 Development режим - Service Worker отключен');
    return;
  }
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Кэшируем статические ресурсы');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker установлен');
        return self.skipWaiting();
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            console.log('🗑️ Удаляем старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🚀 Service Worker активирован');
      return self.clients.claim();
    })
  );
});

// Перехват запросов (только для production)
self.addEventListener('fetch', (event) => {
  // В development режиме не перехватываем запросы
  if (self.location.hostname === 'localhost') {
    return;
  }
  
  const { request } = event;
  const url = new URL(request.url);

  // НЕ перехватываем WebSocket соединения
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // НЕ перехватываем запросы к Vite dev server
  if (url.hostname === 'localhost' && (url.port === '5173' || url.port === '3000')) {
    return;
  }

  // НЕ перехватываем запросы к backend API
  if (url.hostname === 'localhost' && url.port === '3002') {
    return;
  }

  // НЕ перехватываем запросы к внешним API
  if (url.hostname !== 'localhost' && url.hostname !== window.location.hostname) {
    return;
  }

  // Кэшируем API запросы
  if (API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Кэшируем статические ресурсы
  if (request.method === 'GET' && request.destination !== 'document') {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Для остальных запросов используем сеть
  event.respondWith(fetch(request));
});

// Обработка API запросов
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Пытаемся получить из сети
    const networkResponse = await fetch(request);
    
    // Кэшируем успешные ответы
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // Если сеть недоступна, возвращаем из кэша
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📦 API ответ из кэша:', request.url);
      return cachedResponse;
    }
    
    // Возвращаем fallback
    return new Response(
      JSON.stringify({ error: 'Сеть недоступна', cached: false }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Обработка статических ресурсов
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // Сначала проверяем кэш
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Если нет в кэше, загружаем из сети
    const networkResponse = await fetch(request);
    
    // Кэшируем успешные ответы
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // Возвращаем fallback для изображений
    if (request.destination === 'image') {
      return new Response(
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIGltYWdlPC90ZXh0Pjwvc3ZnPg==',
        {
          headers: { 'Content-Type': 'image/svg+xml' }
        }
      );
    }
    
    throw error;
  }
}

// Очистка старых кэшей
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

