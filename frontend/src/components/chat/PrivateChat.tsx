import React, { useState, useEffect, useRef } from 'react';
import { Send, UserPlus, Lock, X } from 'lucide-react';
import { User as UserType, Message as MessageType } from '../../types/chat';

interface PrivateChatProps {
  currentUser: UserType;
  onClose: () => void;
}

interface PrivateMessage extends MessageType {
  isPrivate: true;
  recipientId: string;
}

interface PrivateChatState {
  [userId: string]: {
    messages: PrivateMessage[];
    isOpen: boolean;
    unreadCount: number;
  };
}

export const PrivateChat: React.FC<PrivateChatProps> = ({
  currentUser,
  onClose
}) => {
  const [privateChats, setPrivateChats] = useState<PrivateChatState>({});
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Загрузка доступных пользователей
  useEffect(() => {
    // Здесь должен быть API запрос для получения пользователей
    // Пока используем моковые данные
    const mockUsers: UserType[] = [
      {
        id: '2',
        name: 'Алексей',
        avatar: null,
        status: 'online',
        role: 'member',
        joinedAt: new Date()
      },
      {
        id: '3',
        name: 'Мария',
        avatar: null,
        status: 'online',
        role: 'member',
        joinedAt: new Date()
      },
      {
        id: '4',
        name: 'Дмитрий',
        avatar: null,
        status: 'away',
        role: 'member',
        joinedAt: new Date()
      }
    ];
    setAvailableUsers(mockUsers);
  }, []);

  // Автопрокрутка к последнему сообщению
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [privateChats, selectedChat]);

  // Открытие приватного чата
  const openPrivateChat = (userId: string) => {
    if (!privateChats[userId]) {
      setPrivateChats(prev => ({
        ...prev,
        [userId]: {
          messages: [],
          isOpen: true,
          unreadCount: 0
        }
      }));
    } else {
      setPrivateChats(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          isOpen: true,
          unreadCount: 0
        }
      }));
    }
    setSelectedChat(userId);
    setShowUserList(false);
  };

  // Закрытие приватного чата
  const closePrivateChat = (userId: string) => {
    setPrivateChats(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        isOpen: false
      }
    }));
    if (selectedChat === userId) {
      setSelectedChat(null);
    }
  };

  // Отправка приватного сообщения
  const sendPrivateMessage = (recipientId: string, content: string) => {
    if (!content.trim()) return;

    const newMessage: PrivateMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      author: currentUser,
      roomId: `private_${currentUser.id}_${recipientId}`,
      timestamp: new Date(),
      isEdited: false,
      replyTo: undefined,
      attachments: [],
      reactions: [],
      canEdit: true,
      canDelete: true,
      isPrivate: true,
      recipientId
    };

    setPrivateChats(prev => ({
      ...prev,
      [recipientId]: {
        ...prev[recipientId],
        messages: [...(prev[recipientId]?.messages || []), newMessage]
      }
    }));

    setMessageText('');
  };

  // Получение имени пользователя по ID
  const getUserName = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    return user?.name || `Пользователь ${userId}`;
  };

  // Получение статуса пользователя
  const getUserStatus = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    return user?.status || 'offline';
  };

  // Получение общего количества непрочитанных сообщений
  const getTotalUnreadCount = () => {
    return Object.values(privateChats).reduce((total, chat) => total + chat.unreadCount, 0);
  };

  return (
    <div className="private-chat-container">
      {/* Кнопка приватных сообщений */}
      <button
        onClick={() => setShowUserList(!showUserList)}
        className="btn-modern relative"
        title="Приватные сообщения"
      >
        <Lock size={16} />
        Приват
        {getTotalUnreadCount() > 0 && (
          <span className="unread-badge">
            {getTotalUnreadCount() > 9 ? '9+' : getTotalUnreadCount()}
          </span>
        )}
      </button>

      {/* Список пользователей для приватного чата */}
      {showUserList && (
        <div className="user-list-panel">
          <div className="panel-header">
            <h3>Начать приватный чат</h3>
            <div className="header-actions">
              <button
                onClick={() => setShowUserList(false)}
                className="btn-modern"
              >
                <X size={16} />
              </button>
              <button
                onClick={onClose}
                className="btn-modern close-btn"
                title="Закрыть приватные чаты"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="user-list">
            {availableUsers
              .filter(user => user.id !== currentUser.id)
              .map(user => (
                <div
                  key={user.id}
                  className="user-item"
                  onClick={() => openPrivateChat(user.id)}
                >
                  <div className="user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className={`status-indicator ${user.status}`} />
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-status">{user.status}</div>
                  </div>
                  <button className="start-chat-btn">
                    <UserPlus size={16} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Окна приватных чатов */}
      {Object.entries(privateChats).map(([userId, chat]) => (
        chat.isOpen && (
          <div key={userId} className="private-chat-window">
            <div className="chat-window-header">
              <div className="chat-user-info">
                <div className="user-avatar">
                  <div className="avatar-placeholder">
                    {getUserName(userId).charAt(0).toUpperCase()}
                  </div>
                  <span className={`status-indicator ${getUserStatus(userId)}`} />
                </div>
                <div className="user-details">
                  <div className="user-name">{getUserName(userId)}</div>
                  <div className="user-status">{getUserStatus(userId)}</div>
                </div>
              </div>
              <button
                onClick={() => closePrivateChat(userId)}
                className="close-chat-btn"
              >
                <X size={16} />
              </button>
            </div>

            <div className="chat-messages">
              {chat.messages.length === 0 ? (
                <div className="no-messages">
                  <p>Начните приватный чат с {getUserName(userId)}</p>
                </div>
              ) : (
                chat.messages.map(message => (
                  <div
                    key={message.id}
                    className={`private-message ${message.author.id === currentUser.id ? 'own' : 'other'}`}
                  >
                    <div className="message-content">{message.content}</div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
              <div ref={messageEndRef} />
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Сообщение для ${getUserName(userId)}...`}
                className="private-message-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendPrivateMessage(userId, messageText);
                  }
                }}
              />
              <button
                onClick={() => sendPrivateMessage(userId, messageText)}
                disabled={!messageText.trim()}
                className="send-private-btn"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default PrivateChat;
