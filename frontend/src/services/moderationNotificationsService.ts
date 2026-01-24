/**
 * Сервис уведомлений о модерации
 * Минималистичный, информативный, без спама
 */

export type ContentType = 'post' | 'marker' | 'route' | 'event';
export type ModerationStatus = 'approved' | 'rejected' | 'pending';

import { storageService } from './storageService';

export interface ModerationNotification {
  id: string;
  contentType: ContentType;
  contentId: string;
  contentTitle?: string;
  status: ModerationStatus;
  reason?: string; // Причина отклонения
  timestamp: number;
  read: boolean;
}

class ModerationNotificationsService {
  private listeners: Set<(notification: ModerationNotification) => void> = new Set();
  private notificationHistory: ModerationNotification[] = [];
  private enabled: boolean = true; // По умолчанию включено

  /**
   * Подписаться на уведомления
   */
  onNotification(callback: (notification: ModerationNotification) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Отправить уведомление
   */
  notify(notification: Omit<ModerationNotification, 'id' | 'timestamp' | 'read'>) {
    if (!this.enabled) {
      return; // Не отправляем, если уведомления отключены
    }

    const fullNotification: ModerationNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false
    };

    // Сохраняем в историю (последние 60 дней)
    this.notificationHistory.unshift(fullNotification);
    const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
    this.notificationHistory = this.notificationHistory.filter(
      n => n.timestamp > sixtyDaysAgo
    );

    // Сохраняем в localStorage
    this.saveToLocalStorage();

    // Уведомляем слушателей
    this.listeners.forEach(cb => cb(fullNotification));
  }

  /**
   * Получить историю уведомлений
   */
  getHistory(): ModerationNotification[] {
    return [...this.notificationHistory];
  }

  /**
   * Получить непрочитанные уведомления
   */
  getUnreadCount(): number {
    return this.notificationHistory.filter(n => !n.read).length;
  }

  /**
   * Отметить уведомление как прочитанное
   */
  markAsRead(notificationId: string) {
    const notification = this.notificationHistory.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveToLocalStorage();
    }
  }

  /**
   * Отметить все как прочитанные
   */
  markAllAsRead() {
    this.notificationHistory.forEach(n => n.read = true);
    this.saveToLocalStorage();
  }

  /**
   * Очистить историю
   */
  clearHistory() {
    this.notificationHistory = [];
    this.saveToLocalStorage();
  }

  /**
   * Включить/выключить уведомления
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try { storageService.setItem('moderationNotificationsEnabled', String(enabled)); } catch {}
  }

  /**
   * Проверить, включены ли уведомления
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Загрузить из localStorage
   */
  loadFromLocalStorage() {
    try {
      const saved = storageService.getItem('moderationNotificationsHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.notificationHistory = parsed.map((n: any) => ({
          ...n,
          timestamp: n.timestamp || Date.now()
        }));
      }

      const enabled = storageService.getItem('moderationNotificationsEnabled');
      if (enabled !== null) {
        this.enabled = enabled === 'true';
      }
    } catch (error) {
      console.error('Ошибка загрузки истории уведомлений:', error);
    }
  }

  /**
   * Сохранить в localStorage
   */
  private saveToLocalStorage() {
    try {
      storageService.setItem('moderationNotificationsHistory', JSON.stringify(this.notificationHistory));
    } catch (error) {
      console.error('Ошибка сохранения истории уведомлений:', error);
    }
  }

  /**
   * Инициализация
   */
  init() {
    this.loadFromLocalStorage();
    
    // Слушаем события модерации
    if (typeof window !== 'undefined') {
      // Одобрение
      window.addEventListener('content-approved', ((event: CustomEvent) => {
        const detail = event.detail;
        this.notify({
          contentType: detail.contentType || 'post',
          contentId: detail.contentId || detail.id,
          contentTitle: detail.title || detail.contentTitle,
          status: 'approved'
        });
      }) as EventListener);

      // Отклонение
      window.addEventListener('content-rejected', ((event: CustomEvent) => {
        const detail = event.detail;
        this.notify({
          contentType: detail.contentType || 'post',
          contentId: detail.contentId || detail.id,
          contentTitle: detail.title || detail.contentTitle,
          status: 'rejected',
          reason: detail.reason || detail.message
        });
      }) as EventListener);

      // На модерации (только при ручной отправке)
      window.addEventListener('content-pending', ((event: CustomEvent) => {
        const detail = event.detail;
        // Показываем только один раз при отправке
        if (detail.showOnce) {
          this.notify({
            contentType: detail.contentType || 'post',
            contentId: detail.contentId || detail.id,
            contentTitle: detail.title || detail.contentTitle,
            status: 'pending'
          });
        }
      }) as EventListener);
    }
  }
}

// Экспортируем singleton
export const moderationNotificationsService = new ModerationNotificationsService();

// Инициализируем при загрузке
if (typeof window !== 'undefined') {
  moderationNotificationsService.init();
}

