/**
 * Сервис уведомлений о статусе модерации
 */

export type ModerationStatus = 'approved' | 'rejected' | 'revision' | 'pending';

export interface ModerationNotification {
  contentType: 'post' | 'marker' | 'event' | 'route';
  contentId: string;
  status: ModerationStatus;
  message?: string;
  timestamp: number;
}

class ModerationNotificationsService {
  private listeners: Set<(notification: ModerationNotification) => void> = new Set();
  private notificationHistory: ModerationNotification[] = [];

  /**
   * Подписаться на уведомления о модерации
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
  notify(notification: Omit<ModerationNotification, 'timestamp'>) {
    const fullNotification: ModerationNotification = {
      ...notification,
      timestamp: Date.now()
    };

    // Сохраняем в историю
    this.notificationHistory.unshift(fullNotification);
    if (this.notificationHistory.length > 50) {
      this.notificationHistory = this.notificationHistory.slice(0, 50);
    }

    // Уведомляем слушателей
    this.listeners.forEach(cb => cb(fullNotification));

    // Показываем браузерное уведомление (если разрешено)
    this.showBrowserNotification(fullNotification);
  }

  /**
   * Показать браузерное уведомление
   */
  private async showBrowserNotification(notification: ModerationNotification) {
    if (!('Notification' in window)) {
      return;
    }

    // Запрашиваем разрешение, если ещё не запрашивали
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      const statusText = {
        approved: 'одобрен',
        rejected: 'отклонён',
        revision: 'отправлен на доработку',
        pending: 'на модерации'
      };

      const contentTypeText = {
        post: 'Пост',
        marker: 'Метка',
        event: 'Событие',
        route: 'Маршрут'
      };

      new Notification(`${contentTypeText[notification.contentType]} ${statusText[notification.status]}`, {
        body: notification.message || `Ваш контент был ${statusText[notification.status]}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `moderation-${notification.contentId}`,
        requireInteraction: notification.status === 'rejected' || notification.status === 'revision'
      });
    }
  }

  /**
   * Получить историю уведомлений
   */
  getHistory(): ModerationNotification[] {
    return [...this.notificationHistory];
  }

  /**
   * Очистить историю
   */
  clearHistory() {
    this.notificationHistory = [];
  }
}

// Экспортируем singleton
export const moderationNotifications = new ModerationNotificationsService();

// Слушаем события одобрения/отклонения контента
if (typeof window !== 'undefined') {
  // Событие одобрения
  window.addEventListener('content-approved', ((event: CustomEvent) => {
    moderationNotifications.notify({
      contentType: event.detail.contentType || 'post',
      contentId: event.detail.contentId,
      status: 'approved',
      message: 'Ваш контент был одобрен и опубликован!'
    });
  }) as EventListener);

  // Событие отклонения
  window.addEventListener('content-rejected', ((event: CustomEvent) => {
    moderationNotifications.notify({
      contentType: event.detail.contentType || 'post',
      contentId: event.detail.contentId,
      status: 'rejected',
      message: event.detail.reason || 'Ваш контент был отклонён модератором'
    });
  }) as EventListener);

  // Событие отправки на доработку
  window.addEventListener('content-revision', ((event: CustomEvent) => {
    moderationNotifications.notify({
      contentType: event.detail.contentType || 'post',
      contentId: event.detail.contentId,
      status: 'revision',
      message: event.detail.comment || 'Ваш контент отправлен на доработку'
    });
  }) as EventListener);
}

