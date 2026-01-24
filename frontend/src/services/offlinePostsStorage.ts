/**
 * Адаптер для обратной совместимости с offlinePostsStorage
 * Использует универсальный offlineContentStorage под капотом
 */

import { 
  offlineContentStorage, 
  OfflinePostDraft as UniversalPostDraft,
  AnyOfflineDraft
} from './offlineContentStorage';

// Экспортируем старый интерфейс для обратной совместимости
export interface OfflinePostDraft {
  id: string;
  createdAt: number;
  text: string;
  title?: string; // Добавляем title
  images: File[];
  track: GeoJSON.Feature<GeoJSON.LineString> | null;
  status: 'draft' | 'uploading' | 'failed' | 'failed_permanent';
  retries: number;
  regionId: string;
  hasImages: boolean;
  hasTrack: boolean;
}

class OfflinePostsStorageAdapter {
  /**
   * Преобразовать универсальный черновик в старый формат
   */
  private toLegacyFormat(draft: UniversalPostDraft): OfflinePostDraft {
    return {
      id: draft.id,
      createdAt: draft.createdAt,
      text: draft.contentData.text,
      title: draft.contentData.title, // Сохраняем title
      images: draft.images || [],
      track: draft.track || null,
      status: draft.status,
      retries: draft.retries,
      regionId: draft.regionId,
      hasImages: draft.hasImages,
      hasTrack: draft.hasTrack || false
    };
  }

  /**
   * Преобразовать старый формат в универсальный
   */
  private toUniversalFormat(draft: Omit<OfflinePostDraft, 'id' | 'createdAt' | 'retries'>): Omit<UniversalPostDraft, 'id' | 'createdAt' | 'retries'> {
    return {
      contentType: 'post',
      contentData: {
        text: draft.text,
        title: draft.title, // Используем переданный title
        route_id: undefined,
        marker_id: undefined,
        event_id: undefined
      },
      images: draft.images,
      hasImages: draft.hasImages,
      track: draft.track,
      hasTrack: draft.hasTrack,
      status: draft.status,
      regionId: draft.regionId
    };
  }

  async init(): Promise<void> {
    return offlineContentStorage.init();
  }

  async clearOldLocalStorageDrafts(): Promise<void> {
    // Миграция выполняется автоматически в offlineContentStorage
    return Promise.resolve();
  }

  async addDraft(draft: Omit<OfflinePostDraft, 'id' | 'createdAt' | 'retries'>): Promise<string> {
    const universalDraft = this.toUniversalFormat(draft);
    return offlineContentStorage.addDraft(universalDraft);
  }

  async getDraft(id: string): Promise<OfflinePostDraft | null> {
    const draft = await offlineContentStorage.getDraft(id);
    if (!draft || draft.contentType !== 'post') {
      return null;
    }
    return this.toLegacyFormat(draft as UniversalPostDraft);
  }

  async getAllDrafts(status?: OfflinePostDraft['status']): Promise<OfflinePostDraft[]> {
    const drafts = await offlineContentStorage.getAllDrafts('post', status);
    return drafts.map(d => this.toLegacyFormat(d as UniversalPostDraft));
  }

  async updateDraftStatus(
    id: string,
    status: OfflinePostDraft['status'],
    retries?: number
  ): Promise<void> {
    return offlineContentStorage.updateDraftStatus(id, status, retries);
  }

  async deleteDraft(id: string): Promise<void> {
    return offlineContentStorage.deleteDraft(id);
  }

  async cleanupOldDrafts(): Promise<number> {
    return offlineContentStorage.cleanupOldDrafts();
  }

  async getDraftsCount(status?: OfflinePostDraft['status']): Promise<number> {
    return offlineContentStorage.getDraftsCount('post', status);
  }
}

// Экспортируем singleton для обратной совместимости
export const offlinePostsStorage = new OfflinePostsStorageAdapter();

// Инициализация при импорте модуля
if (typeof window !== 'undefined') {
  offlinePostsStorage.init().catch(console.error);
}
