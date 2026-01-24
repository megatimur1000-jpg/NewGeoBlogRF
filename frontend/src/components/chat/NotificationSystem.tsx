import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Volume2, VolumeX } from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'reaction' | 'mention' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationSystemProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  isEnabled,
  onToggle
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Звуки уведомлений
  useEffect(() => {
    if (soundEnabled) {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.3;
    }
  }, [soundEnabled]);

  // Добавление нового уведомления
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Максимум 10 уведомлений

    // Воспроизводим звук
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Игнорируем ошибки автовоспроизведения
      });
    }

    // Показываем всплывающее уведомление
    showDesktopNotification(newNotification);
  };

  // Desktop уведомления
  const showDesktopNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'chat-notification'
      });
    }
  };

  // Запрос разрешения на уведомления
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        addNotification({
          type: 'system',
          title: 'Уведомления включены',
          message: 'Теперь вы будете получать уведомления о новых сообщениях'
        });
      }
    }
  };

  // Отметить уведомление как прочитанное
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Удалить уведомление
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Очистить все уведомления
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Получить иконку для типа уведомления
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'reaction':
        return '👍';
      case 'mention':
        return '👤';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  // Получить цвет для типа уведомления
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return 'bg-blue-500';
      case 'reaction':
        return 'bg-green-500';
      case 'mention':
        return 'bg-purple-500';
      case 'system':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-system">
      {/* Кнопка уведомлений */}
      <div className="notification-toggle">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="btn-modern relative"
          title="Уведомления"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Переключатель звука */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="btn-modern ml-2"
          title={soundEnabled ? 'Отключить звук' : 'Включить звук'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Переключатель уведомлений */}
        <button
          onClick={() => onToggle(!isEnabled)}
          className={`btn-modern ml-2 ${!isEnabled ? 'opacity-50' : ''}`}
          title={isEnabled ? 'Отключить уведомления' : 'Включить уведомления'}
        >
          {isEnabled ? '🔔' : '🔕'}
        </button>
      </div>

      {/* Панель уведомлений */}
      {showNotifications && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Уведомления</h3>
            <div className="notification-controls">
              <button
                onClick={clearAllNotifications}
                className="btn-modern text-sm"
              >
                Очистить все
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="btn-modern text-sm"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>Нет уведомлений</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    <span className={`notification-type ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {notification.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="notification-remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Запрос разрешения на уведомления */}
          {Notification.permission === 'default' && (
            <div className="notification-permission">
              <button
                onClick={requestNotificationPermission}
                className="btn-modern w-full"
              >
                Разрешить уведомления
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Хук для использования уведомлений в других компонентах
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
  };

  return { notifications, addNotification };
};

export default NotificationSystem;
