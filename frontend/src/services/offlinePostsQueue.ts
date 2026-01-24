/**
 * Адаптер для обратной совместимости с offlinePostsQueue
 * Использует универсальный offlineContentQueue под капотом
 */

import { offlineContentQueue, UploadProgress as UniversalUploadProgress } from './offlineContentQueue';

interface UploadProgress {
  postId: string;
  stage: 'creating' | 'uploading_images' | 'uploading_track' | 'completed';
  progress: number;
  error?: string;
}

class OfflinePostsQueueAdapter {
  /**
   * Преобразовать универсальный прогресс в старый формат
   */
  private toLegacyProgress(progress: UniversalUploadProgress | null): UploadProgress | null {
    if (!progress) {
      return null;
    }

    if (progress.contentType !== 'post') {
      return null; // Игнорируем прогресс других типов
    }

    return {
      postId: progress.contentId,
      stage: progress.stage as any,
      progress: progress.progress,
      error: progress.error
    };
  }

  onProgress(callback: (progress: UploadProgress | null) => void): () => void {
    return offlineContentQueue.onProgress((progress) => {
      const legacyProgress = this.toLegacyProgress(progress);
      callback(legacyProgress);
    });
  }

  async uploadDraftById(draftId: string): Promise<void> {
    return offlineContentQueue.uploadDraftById(draftId);
  }

  start(): void {
    offlineContentQueue.start();
  }

  getCurrentProgress(): UploadProgress | null {
    const progress = offlineContentQueue.getCurrentProgress();
    return this.toLegacyProgress(progress);
  }
}

// Экспортируем singleton для обратной совместимости
export const offlinePostsQueue = new OfflinePostsQueueAdapter();
