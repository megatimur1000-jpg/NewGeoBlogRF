/**
 * Сервис для локального хранения контента на модерации
 * Контент сохраняется в localStorage до одобрения админом
 */

export type ContentType = 'marker' | 'post' | 'event' | 'complaint' | 'suggestion' | 'route';

export interface PendingContent {
  id: string;
  type: ContentType;
  data: any;
  created_at: string;
  author_id?: string;
  author_name?: string;
  status?: 'pending' | 'active' | 'rejected' | 'revision' | 'hidden'; // Статус модерации
  ai_analysis?: {
    rating: number;
    confidence: number;
    reason: string;
    suggestion: 'approve' | 'reject' | 'review';
    category?: string;
    issues?: string[];
  };
}

const STORAGE_PREFIX = 'pending_moderation_';
const STORAGE_INDEX_KEY = 'pending_moderation_index';
import storageService from './storageService';

/**
 * Получить ключ для хранения контента
 */
function getStorageKey(contentType: ContentType, id: string): string {
  return `${STORAGE_PREFIX}${contentType}_${id}`;
}

/**
 * Получить индекс всех контентов на модерации
 */
function getIndex(): string[] {
  try {
    const index = storageService.getItem(STORAGE_INDEX_KEY);
    return index ? JSON.parse(index) : [];
  } catch {
    return [];
  }
}

/**
 * Обновить индекс
 */
function updateIndex(keys: string[]): void {
  try {
    storageService.setItem(STORAGE_INDEX_KEY, JSON.stringify(keys));
  } catch (error) {
    console.error('Ошибка обновления индекса модерации:', error);
  }
}

/**
 * Сохранить контент на модерации
 */
export function savePendingContent(content: PendingContent): void {
    try {
    const key = getStorageKey(content.type, content.id);
    storageService.setItem(key, JSON.stringify(content));
    
    // Обновляем индекс
    const index = getIndex();
    if (!index.includes(key)) {
      index.push(key);
      updateIndex(index);
    }
  } catch (error) {
    console.error('Ошибка сохранения контента на модерации:', error);
  }
}

/**
 * Получить контент на модерации по типу и ID
 */
export function getPendingContent(contentType: ContentType, id: string): PendingContent | null {
    try {
    const key = getStorageKey(contentType, id);
    const data = storageService.getItem(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (parseError) {
      console.error('Ошибка парсинга контента на модерации:', parseError, { key, data });
      return null;
    }
  } catch (error) {
    console.error('Ошибка получения контента на модерации:', error);
    return null;
  }
}

/**
 * Получить весь контент на модерации по типу
 */
export function getAllPendingContent(contentType?: ContentType): PendingContent[] {
  try {
    const index = getIndex();
    const contents: PendingContent[] = [];
    
    for (const key of index) {
      if (!key.startsWith(STORAGE_PREFIX)) continue;
      
      const data = storageService.getItem(key);
      if (!data) continue;
      
      try {
        const content: PendingContent = JSON.parse(data);
        
        // Фильтруем по типу, если указан
        if (contentType && content.type !== contentType) {
          continue;
        }
        
        contents.push(content);
      } catch {
        // Пропускаем повреждённые данные
        continue;
      }
    }
    
    // Сортируем по дате создания (новые сначала)
    return contents.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Ошибка получения контента на модерации:', error);
    return [];
  }
}

/**
 * Удалить контент из модерации (после одобрения/отклонения)
 */
export function removePendingContent(contentType: ContentType, id: string): void {
  try {
    const key = getStorageKey(contentType, id);
    storageService.removeItem(key);
    
    // Обновляем индекс
    const index = getIndex();
    const newIndex = index.filter(k => k !== key);
    updateIndex(newIndex);
  } catch (error) {
    console.error('Ошибка удаления контента из модерации:', error);
  }
}

/**
 * Получить количество контента на модерации по типам
 */
export function getPendingContentCounts(): Record<ContentType, number> {
  const contents = getAllPendingContent();
  const counts: Record<ContentType, number> = {
    marker: 0,
    post: 0,
    event: 0,
    complaint: 0,
    suggestion: 0,
    route: 0
  };
  
  contents.forEach(content => {
    if (content.type in counts) {
      counts[content.type]++;
    }
  });
  
  return counts;
}

/**
 * Очистить весь контент на модерации (для тестирования)
 */
export function clearAllPendingContent(): void {
  try {
    const index = getIndex();
    index.forEach(key => {
      storageService.removeItem(key);
    });
    updateIndex([]);
  } catch (error) {
    console.error('Ошибка очистки контента на модерации:', error);
  }
}

/**
 * Очистить зависшие посты (которые не прошли из-за ошибок)
 * Удаляет посты, которые старше указанного времени (по умолчанию 1 час)
 */
export function clearStuckPendingContent(contentType: ContentType, maxAge: number = 3600000): number {
  try {
    const contents = getAllPendingContent(contentType);
    const now = Date.now();
    let removedCount = 0;
    
    for (const content of contents) {
      const createdAt = new Date(content.created_at).getTime();
      const age = now - createdAt;
      
      // Удаляем посты старше maxAge (по умолчанию 1 час)
      if (age > maxAge) {
        removePendingContent(contentType, content.id);
        removedCount++;
        // console.log(`🗑️ Удален зависший пост: ${content.id} (возраст: ${Math.round(age / 1000 / 60)} минут)`);
      }
    }
    
    if (removedCount > 0) {
      // console.log(`✅ Очищено ${removedCount} зависших постов типа ${contentType}`);
    }
    
    return removedCount;
  } catch (error) {
    console.error('Ошибка очистки зависших постов:', error);
    return 0;
  }
}

