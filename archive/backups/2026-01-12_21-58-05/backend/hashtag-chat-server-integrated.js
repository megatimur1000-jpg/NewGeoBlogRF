import { WebSocketServer } from 'ws';
import { Pool } from 'pg';
import databaseConfig from './database.config.simple.cjs';

const pool = new Pool(databaseConfig);

class HashtagChatServer {
  constructor(server) {
    // Создаем WebSocket сервер на существующем HTTP сервере
    this.wss = new WebSocketServer({ server });
    
    // Хранилище клиентов и комнат
    this.clients = new Map(); // resourceId -> { connection, userId, username, avatar, roomSubscriptions }
    this.rooms = new Map(); // hashtag -> Set of resourceIds
    
    this.init();
  }

  init() {
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
  }

  handleConnection(ws, req) {
    const resourceId = Math.random().toString(36).substr(2, 9);
    
    // Сохраняем новое соединение
    this.clients.set(resourceId, {
      connection: ws,
      userId: null,
      username: null,
      avatar: null,
      roomSubscriptions: new Set()
    });

    ws.on('message', (data) => {
      this.handleMessage(resourceId, data);
    });

    ws.on('close', () => {
      this.handleDisconnect(resourceId);
    });

    ws.on('error', (error) => {
      this.handleDisconnect(resourceId);
    });
  }

  handleMessage(resourceId, data) {
    try {
      const message = JSON.parse(data);
      
      if (!message || !message.type) {
        return;
      }

      switch (message.type) {
        case 'join':
          this.handleJoinRoom(resourceId, message);
          break;
          
        case 'message':
          this.handleChatMessage(resourceId, message);
          break;
          
        case 'chat_message':
          this.handleChatMessage(resourceId, message);
          break;
          
        case 'typing':
          this.handleTyping(resourceId, message);
          break;
          
        case 'leave':
          this.handleLeaveRoom(resourceId, message);
          break;

        case 'reaction':
          this.handleReaction(resourceId, message);
          break;

        case 'edit_message':
          this.handleEditMessage(resourceId, message);
          break;

        case 'delete_message':
          this.handleDeleteMessage(resourceId, message);
          break;
          
        default:
          }
    } catch (error) {
      }
  }

  handleJoinRoom(resourceId, data) {
    if (!data.room || !data.user_id || !data.username) {
      return;
    }

    const room = data.room;
    const userId = data.user_id;
    const username = data.username;
    const avatar = data.avatar || 'assets/images/default-avatar.svg';

    // Обновляем информацию о клиенте
    const client = this.clients.get(resourceId);
    if (client) {
      client.userId = userId;
      client.username = username;
      client.avatar = avatar;
    }

    // Создаем комнату, если она не существует
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }

    // Добавляем клиента в комнату
    this.rooms.get(room).add(resourceId);
    client.roomSubscriptions.add(room);

    // Обновляем количество онлайн пользователей в БД
    this.updateOnlineUsers(room);

    // Уведомляем всех в комнате о новом участнике
    this.broadcastToRoom(room, {
      type: 'user_joined',
      user_id: userId,
      username: username,
      avatar: avatar,
      room: room,
      online_users: this.rooms.get(room).size
    });

    }

  async handleChatMessage(resourceId, data) {
    if (!data.room || !data.message) {
      return;
    }

    const client = this.clients.get(resourceId);
    if (!client || !client.userId) {
      return;
    }

    const room = data.room;
    const message = data.message;
    const imageUrl = data.image_url || null;

    try {
      // Сохраняем сообщение в базу данных
      const query = `
        INSERT INTO hashtag_chat_messages (user_id, hashtag, message, image_url)
        VALUES ($1, $2, $3, $4)
        RETURNING id, created_at
      `;
      
      const result = await pool.query(query, [client.userId, room, message, imageUrl]);
      const savedMessage = result.rows[0];

      // Обновляем last_activity в комнате
      await pool.query(
        'UPDATE hashtag_chat_rooms SET last_activity = NOW() WHERE hashtag = $1',
        [room]
      );

      // Отправляем сообщение всем в комнате
      this.broadcastToRoom(room, {
        type: 'new_message',
        id: savedMessage.id,
        user_id: client.userId,
        username: client.username,
        avatar: client.avatar,
        message: message,
        image_url: imageUrl,
        room: room,
        created_at: savedMessage.created_at
      });

      } catch (error) {
      }
  }

  handleTyping(resourceId, data) {
    const client = this.clients.get(resourceId);
    if (!client || !data.room) return;

    // Отправляем уведомление о печати всем в комнате
    this.broadcastToRoom(data.room, {
      type: 'typing',
      user_id: client.userId,
      username: client.username,
      room: data.room
    });
  }

  // Обработка реакций на сообщения
  handleReaction(resourceId, data) {
    const client = this.clients.get(resourceId);
    if (!client || !data.room || !data.message_id || !data.emoji) return;

    // Сохраняем реакцию в БД
    this.saveReactionToDB(data.message_id, data.emoji, client.userId, client.username);

    // Отправляем реакцию всем в комнате
    this.broadcastToRoom(data.room, {
      type: 'reaction_added',
      message_id: data.message_id,
      emoji: data.emoji,
      user_id: client.userId,
      username: client.username,
      room: data.room,
      timestamp: new Date()
    });
  }

  // Обработка редактирования сообщений
  handleEditMessage(resourceId, data) {
    const client = this.clients.get(resourceId);
    if (!client || !data.room || !data.message_id || !data.new_content) return;

    // Проверяем права на редактирование
    this.checkEditPermissions(data.message_id, client.userId).then(canEdit => {
      if (!canEdit) {
        return;
      }

      // Сохраняем изменения в БД
      this.updateMessageInDB(data.message_id, data.new_content);

      // Отправляем обновленное сообщение всем в комнате
      this.broadcastToRoom(data.room, {
        type: 'message_edited',
        message_id: data.message_id,
        new_content: data.new_content,
        user_id: client.userId,
        username: client.username,
        room: data.room,
        timestamp: new Date()
      });
    });
  }

  // Обработка удаления сообщений
  handleDeleteMessage(resourceId, data) {
    const client = this.clients.get(resourceId);
    if (!client || !data.room || !data.message_id) return;

    // Проверяем права на удаление
    this.checkDeletePermissions(data.message_id, client.userId).then(canDelete => {
      if (!canDelete) {
        return;
      }

      // Удаляем сообщение из БД
      this.deleteMessageFromDB(data.message_id);

      // Отправляем уведомление об удалении всем в комнате
      this.broadcastToRoom(data.room, {
        type: 'message_deleted',
        message_id: data.message_id,
        user_id: client.userId,
        username: client.username,
        room: data.room,
        timestamp: new Date()
      });
    });
  }

  handleLeaveRoom(resourceId, data) {
    if (!data.room) return;

    const room = data.room;
    const client = this.clients.get(resourceId);
    
    if (client && client.roomSubscriptions.has(room)) {
      client.roomSubscriptions.delete(room);
      
      if (this.rooms.has(room)) {
        this.rooms.get(room).delete(resourceId);
        
        // Удаляем комнату, если она пустая
        if (this.rooms.get(room).size === 0) {
          this.rooms.delete(room);
        }
      }

      // Обновляем количество онлайн пользователей
      this.updateOnlineUsers(room);

      // Уведомляем остальных участников
      this.broadcastToRoom(room, {
        type: 'user_left',
        user_id: client.userId,
        username: client.username,
        room: room,
        online_users: this.rooms.has(room) ? this.rooms.get(room).size : 0
      });

      }
  }

  handleDisconnect(resourceId) {
    const client = this.clients.get(resourceId);
    if (!client) return;

    // Удаляем из всех комнат
    client.roomSubscriptions.forEach(room => {
      this.handleLeaveRoom(resourceId, { room });
    });

    // Удаляем клиента
    this.clients.delete(resourceId);
  }

  broadcastToRoom(room, message) {
    if (!this.rooms.has(room)) return;

    const roomClients = this.rooms.get(room);
    const messageStr = JSON.stringify(message);

    roomClients.forEach(resourceId => {
      const client = this.clients.get(resourceId);
      if (client && client.connection.readyState === 1) { // WebSocket.OPEN
        client.connection.send(messageStr);
      }
    });
  }

  async updateOnlineUsers(room) {
    try {
      const onlineCount = this.rooms.has(room) ? this.rooms.get(room).size : 0;
      await pool.query(
        'UPDATE hashtag_chat_rooms SET online_users = $1 WHERE hashtag = $2',
        [onlineCount, room]
      );
    } catch (error) {
      }
  }

  // Метод для получения статистики
  getStats() {
    return {
      connectedClients: this.clients.size,
      activeRooms: this.rooms.size,
      totalRoomParticipants: Array.from(this.rooms.values()).reduce((sum, clients) => sum + clients.size, 0)
    };
  }

  // Вспомогательные методы для работы с БД
  async saveReactionToDB(messageId, emoji, userId, username) {
    try {
      const result = await pool.query(
        'INSERT INTO message_reactions (message_id, emoji, user_id, username, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [messageId, emoji, userId, username]
      );
      } catch (error) {
      }
  }

  async checkEditPermissions(messageId, userId) {
    try {
      const result = await pool.query(
        'SELECT user_id FROM hashtag_chat_messages WHERE id = $1',
        [messageId]
      );
      return result.rows.length > 0 && result.rows[0].user_id == userId;
    } catch (error) {
      return false;
    }
  }

  async checkDeletePermissions(messageId, userId) {
    try {
      const result = await pool.query(
        'SELECT user_id FROM hashtag_chat_messages WHERE id = $1',
        [messageId]
      );
      return result.rows.length > 0 && result.rows[0].user_id == userId;
    } catch (error) {
      return false;
    }
  }

  async updateMessageInDB(messageId, newContent) {
    try {
      const result = await pool.query(
        'UPDATE hashtag_chat_messages SET message = $1, updated_at = NOW() WHERE id = $2',
        [newContent, messageId]
      );
      } catch (error) {
      }
  }

  async deleteMessageFromDB(messageId) {
    try {
      const result = await pool.query(
        'DELETE FROM hashtag_chat_messages WHERE id = $1',
        [messageId]
      );
      } catch (error) {
      }
  }
}

export default HashtagChatServer;

