import { PostDTO } from '../services/postsService';

/**
 * Получить первое изображение из поста
 */
export function getPostImage(post: PostDTO): string | null {
  if (post.photo_urls) {
    const urls = Array.isArray(post.photo_urls) ? post.photo_urls : post.photo_urls.split(',');
    return urls[0] || null;
  }
  return null;
}

/**
 * Получить все изображения из поста
 */
export function getPostImages(post: PostDTO): string[] {
  if (post.photo_urls) {
    const urls = Array.isArray(post.photo_urls) ? post.photo_urls : post.photo_urls.split(',');
    return urls.filter(url => url && url.trim());
  }
  return [];
}

/**
 * Получить локацию из поста
 */
export function getPostLocation(post: PostDTO): string | null {
  // Проверяем наличие location в расширенных свойствах
  if ((post as any).location) {
    return (post as any).location;
  }
  if (post.marker_id && (post as any).marker?.title) {
    return (post as any).marker.title;
  }
  return null;
}

/**
 * Оптимизировать URL изображения для мобильных устройств
 * Добавляет параметры для уменьшения размера и конвертации в WebP
 */
export function optimizeImageUrl(url: string, width?: number, height?: number, quality: number = 80): string {
  if (!url || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    
    // Если это внешний сервис изображений, можно добавить параметры оптимизации
    // Например, для Cloudinary, Imgix и т.д.
    
    // Для локальных изображений или если нет специального сервиса
    // Можно использовать query параметры для указания размера
    if (width) {
      urlObj.searchParams.set('w', width.toString());
    }
    if (height) {
      urlObj.searchParams.set('h', height.toString());
    }
    urlObj.searchParams.set('q', quality.toString());
    
    return urlObj.toString();
  } catch {
    // Если не удалось распарсить URL, возвращаем как есть
    return url;
  }
}

/**
 * Проверить, является ли пост путеводителем
 */
export function isGuidePost(post: PostDTO): boolean {
  return post.content_type === 'guide' || !!post.constructor_data;
}

/**
 * Получить простой текст из поста (без HTML)
 */
export function getSimplePostText(post: PostDTO): string {
  if (!post.body) return '';
  
  // Удаляем HTML теги
  const text = post.body.replace(/<[^>]*>/g, '');
  // Удаляем лишние пробелы
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Парсинг данных путеводителя из поста
 */
export function parseGuideData(post: PostDTO): any {
  if (!isGuidePost(post)) {
    return null;
  }

  // Если есть constructor_data, используем его
  if (post.constructor_data) {
    const data = post.constructor_data;
    
    // Парсим секции из constructor_data
    if (data.paragraphs && Array.isArray(data.paragraphs)) {
      const sections = data.paragraphs.map((para: any, index: number) => {
        const state = para.state || {};
        const hook = state.hook || state;
        
        return {
          id: `section-${index}`,
          title: para.title || state.title || `Секция ${index + 1}`,
          content: para.content || para.text || state.content || '',
          routeId: hook?.type === 'route' ? hook.data?.id : undefined,
          markerId: hook?.type === 'marker' ? hook.data?.id : undefined,
          eventId: hook?.type === 'event' ? hook.data?.id : undefined,
          hasMap: !!(hook?.type && hook.data?.id),
        };
      });

      return {
        sections,
        title: data.title || post.title,
      };
    }
  }

  // Если нет constructor_data, пытаемся парсить из body
  if (post.body) {
    const paragraphs = post.body.split('\n\n').filter((p: string) => p.trim());
    
    const sections = paragraphs.map((para: string, index: number) => {
      // Пытаемся извлечь заголовок из первого предложения
      const lines = para.split('\n');
      const firstLine = lines[0]?.trim() || '';
      const isTitle = firstLine.length < 100 && !firstLine.endsWith('.');
      
      return {
        id: `section-${index}`,
        title: isTitle ? firstLine : `Секция ${index + 1}`,
        content: isTitle ? lines.slice(1).join('\n') : para,
        routeId: post.route_id && index === 0 ? post.route_id : undefined,
        markerId: post.marker_id && index === 0 ? post.marker_id : undefined,
        eventId: post.event_id && index === 0 ? post.event_id : undefined,
        hasMap: !!(post.route_id || post.marker_id || post.event_id) && index === 0,
      };
    });

    return {
      sections,
      title: post.title,
    };
  }

  return null;
}
