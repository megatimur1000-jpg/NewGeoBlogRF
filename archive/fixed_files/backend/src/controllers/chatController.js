import { Pool } from 'pg';
import databaseConfig from '../../database.config.simple.cjs';
const pool = new Pool(databaseConfig);

class ChatController {
  // Получить все чаты пользователя
  async getUserChats(req, res) {
    try {
      const { userId } = req.params;
      
      const query = `
        SELECT 
          cr.*,
          COUNT(cp.user_id) as participant_count,
          cm.content as last_message,
          cm.created_at as last_message_time
        FROM chat_rooms cr
        LEFT JOIN chat_participants cp ON cr.id = cp.room_id
        LEFT JOIN chat_messages cm ON cr.id = cm.room_id
        WHERE cr.id IN (
          SELECT room_id FROM chat_participants WHERE user_id = $1
        )
        AND (cm.id IS NULL OR cm.id = (
          SELECT MAX(id) FROM chat_messages 
          WHERE room_id = cr.id
        ))
        GROUP BY cr.id, cm.content, cm.created_at
        ORDER BY COALESCE(cm.created_at, cr.created_at) DESC
      `;
      
      const result = await pool.query(query, [userId]);
      res.json(result.rows);
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Получить сообщения чата
  async getChatMessages(req, res) {
  try {
    const { roomId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const query = `
        SELECT 
          cm.*,
          u.name as sender_name,
          u.avatar as sender_avatar
        FROM chat_messages cm
        LEFT JOIN users u ON cm.sender_id = u.id
        WHERE cm.room_id = $1 AND cm.is_deleted = false
        ORDER BY cm.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [roomId, limit, offset]);
      res.json(result.rows.reverse()); // Возвращаем в хронологическом порядке
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

// Отправить сообщение
  async sendMessage(req, res) {
    try {
      const { roomId, senderId, content, messageType = 'text', replyToId = null, fileUrls = null } = req.body;
      
      const query = `
        INSERT INTO chat_messages (room_id, sender_id, content, message_type, reply_to_id, file_urls)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const result = await pool.query(query, [roomId, senderId, content, messageType, replyToId, fileUrls]);
      
      // Обновляем last_activity в чате
      await pool.query(
        'UPDATE chat_rooms SET last_activity = NOW() WHERE id = $1',
        [roomId]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Создать чат
  async createChat(req, res) {
    try {
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:       const { name, hashtag, title, description, type, creatorId } = req.body;
      
      if (!hashtag || !title) {
        return res.status(400).json({ error: 'hashtag and title are required' });
      }

      // Проверяем, существует ли уже чат с таким хэштегом
      const existingRoom = await pool.query(
        'SELECT id FROM hashtag_chat_rooms WHERE hashtag = $1 AND deleted_at IS NULL',
        [hashtag]
      );

      if (existingRoom.rows.length > 0) {
        // Возвращаем существующий чат
        const room = existingRoom.rows[0];
        res.json({ 
          message: 'Chat room already exists', 
          id: room.id,
          isExisting: true 
        });
        return;
      }

      // Создаём новый чат
      const participantIds = creatorId ? [creatorId] : [];
      
      const result = await pool.query(
        `INSERT INTO hashtag_chat_rooms 
         (description, hashtag, title, created_at, last_activity, online_users, participant_ids) 
         VALUES ($1, $2, $3, NOW(), NOW(), 0, $4) 
         RETURNING *`,
        [description || '', hashtag, title, participantIds]
      );

      res.status(201).json({ 
        message: 'Chat room created successfully', 
        id: result.rows[0].id,
        isExisting: false 
      });
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Добавить участника в чат
  async addParticipant(req, res) {
    try {
      const { roomId, userId, role = 'member' } = req.body;
      
      const query = `
        INSERT INTO chat_participants (room_id, user_id, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (room_id, user_id) DO UPDATE SET role = $3
        RETURNING *
      `;
      
      const result = await pool.query(query, [roomId, userId, role]);
      res.json(result.rows[0]);
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Удалить участника из чата
  async removeParticipant(req, res) {
    try {
      const { roomId, userId } = req.params;
      
      await pool.query(
        'DELETE FROM chat_participants WHERE room_id = $1 AND user_id = $2',
        [roomId, userId]
      );
      
      res.json({ success: true });
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Получить участников чата
  async getChatParticipants(req, res) {
  try {
    const { roomId } = req.params;
      
      const query = `
        SELECT 
          cp.*,
          u.name,
          u.avatar,
          u.status
        FROM chat_participants cp
        LEFT JOIN users u ON cp.user_id = u.id
        WHERE cp.room_id = $1
        ORDER BY cp.joined_at ASC
      `;
      
      const result = await pool.query(query, [roomId]);
      res.json(result.rows);
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Обновить роль участника
  async updateParticipantRole(req, res) {
    try {
      const { roomId, userId } = req.params;
      const { role } = req.body;
      
      const query = `
        UPDATE chat_participants 
        SET role = $1 
        WHERE room_id = $2 AND user_id = $3
        RETURNING *
      `;
      
      const result = await pool.query(query, [role, roomId, userId]);
      res.json(result.rows[0]);
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Отметить сообщения как прочитанные
  async markAsRead(req, res) {
    try {
      const { roomId, userId } = req.params;
      
      await pool.query(
        'UPDATE chat_participants SET last_read_at = NOW() WHERE room_id = $1 AND user_id = $2',
        [roomId, userId]
      );
      
      res.json({ success: true });
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Добавить реакцию на сообщение
  async addReaction(req, res) {
    try {
      const { messageId, userId, reaction } = req.body;
      
      const query = `
        INSERT INTO message_reactions (message_id, user_id, reaction)
        VALUES ($1, $2, $3)
        ON CONFLICT (message_id, user_id) DO UPDATE SET reaction = $3
        RETURNING *
      `;
      
      const result = await pool.query(query, [messageId, userId, reaction]);
      res.json(result.rows[0]);
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Удалить реакцию
  async removeReaction(req, res) {
    try {
      const { messageId, userId } = req.params;
      
      await pool.query(
        'DELETE FROM message_reactions WHERE message_id = $1 AND user_id = $2',
        [messageId, userId]
      );
      
      res.json({ success: true });
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Получить все комнаты по хэштегам (только активные)
  async getHashtagRooms(req, res) {
    try {
      const { includeArchived = false } = req.query;
      
      let query = `
        SELECT 
          id,
          hashtag,
          title,
          description,
          online_users,
          last_activity,
          created_at,
          is_archived,
          participant_ids
        FROM hashtag_chat_rooms 
        WHERE deleted_at IS NULL  -- НЕ показывать удалённые чаты
      `;
      
      if (!includeArchived) {
        query += ` AND (is_archived IS NULL OR is_archived = false)`;
      }
      
      query += ` ORDER BY last_activity DESC`;
      
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Получить удалённые чаты пользователя (приватная корзина)
  async getDeletedRooms(req, res) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      
      const query = `
        SELECT 
          id,
          hashtag,
          title,
          description,
          online_users,
          last_activity,
          created_at,
          deleted_at,
          deleted_by,
          participant_ids
        FROM hashtag_chat_rooms 
        WHERE deleted_at IS NOT NULL 
        AND (deleted_by = $1 OR $1 = ANY(participant_ids))
        ORDER BY deleted_at DESC
      `;
      
      const result = await pool.query(query, [userId]);
      res.json(result.rows);
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Архивировать чат (с проверкой прав)
  async archiveChat(req, res) {
    try {
      const { roomId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      
      // Проверяем права пользователя
      const checkQuery = `
        SELECT id, deleted_by, participant_ids 
        FROM hashtag_chat_rooms 
        WHERE id = $1 AND deleted_at IS NULL
      `;
      const checkResult = await pool.query(checkQuery, [roomId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Room not found or already deleted' });
      }
      
      const room = checkResult.rows[0];
      const hasAccess = room.deleted_by === userId || 
                       (room.participant_ids && room.participant_ids.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const result = await pool.query(
        'UPDATE hashtag_chat_rooms SET is_archived = true, last_activity = NOW() WHERE id = $1 RETURNING *',
        [roomId]
      );
      
      res.json({ 
        message: 'Chat archived successfully', 
        room: result.rows[0] 
      });
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Удалить чат (мягкое удаление с проверкой прав)
  async deleteChat(req, res) {
    try {
      const { roomId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      
      // Проверяем права пользователя
      const checkQuery = `
        SELECT id, deleted_by, participant_ids 
        FROM hashtag_chat_rooms 
        WHERE id = $1 AND deleted_at IS NULL
      `;
      const checkResult = await pool.query(checkQuery, [roomId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Room not found or already deleted' });
      }
      
      const room = checkResult.rows[0];
      const hasAccess = room.deleted_by === userId || 
                       (room.participant_ids && room.participant_ids.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const result = await pool.query(
        'UPDATE hashtag_chat_rooms SET deleted_at = NOW(), deleted_by = $1, last_activity = NOW() WHERE id = $2 RETURNING *',
        [userId, roomId]
      );
      
      res.json({ 
        message: 'Chat deleted successfully', 
        room: result.rows[0] 
      });
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Восстановить удалённый чат (только владелец/участник)
  async restoreChat(req, res) {
    try {
      const { roomId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      
      // Проверяем права пользователя
      const checkQuery = `
        SELECT id, deleted_by, participant_ids 
        FROM hashtag_chat_rooms 
        WHERE id = $1 AND deleted_at IS NOT NULL
      `;
      const checkResult = await pool.query(checkQuery, [roomId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Deleted room not found' });
      }
      
      const room = checkResult.rows[0];
      const hasAccess = room.deleted_by === userId || 
                       (room.participant_ids && room.participant_ids.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const result = await pool.query(
        'UPDATE hashtag_chat_rooms SET deleted_at = NULL, deleted_by = NULL, last_activity = NOW() WHERE id = $1 RETURNING *',
        [roomId]
      );
      
      res.json({ 
        message: 'Chat restored successfully', 
        room: result.rows[0] 
      });
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Раскомментировать чат (только владелец/участник)
  async unarchiveChat(req, res) {
    try {
      const { roomId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      
      // Проверяем права пользователя
      const checkQuery = `
        SELECT id, deleted_by, participant_ids 
        FROM hashtag_chat_rooms 
        WHERE id = $1 AND is_archived = true AND deleted_at IS NULL
      `;
      const checkResult = await pool.query(checkQuery, [roomId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Archived room not found' });
      }
      
      const room = checkResult.rows[0];
      const hasAccess = room.deleted_by === userId || 
                       (room.participant_ids && room.participant_ids.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const result = await pool.query(
        'UPDATE hashtag_chat_rooms SET is_archived = false, last_activity = NOW() WHERE id = $1 RETURNING *',
        [roomId]
      );
      
      res.json({ 
        message: 'Chat unarchived successfully', 
        room: result.rows[0] 
      });
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

    // Получить сообщения комнаты по хэштегу
  async getHashtagRoomMessages(req, res) {
  try {
    const { roomId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      // Сначала получаем хэштег комнаты
      const roomQuery = 'SELECT hashtag FROM hashtag_chat_rooms WHERE id = $1';
      const roomResult = await pool.query(roomQuery, [roomId]);
      if (roomResult.rows.length === 0) {
        return res.status(404).json({ error: 'Room not found' });
      }
      
      const hashtag = roomResult.rows[0].hashtag;
      // Теперь получаем сообщения по хэштегу
      const messagesQuery = `
        SELECT 
          id,
          hashtag,
          message,
          user_id,
          image_url,
          created_at
        FROM hashtag_chat_messages 
        WHERE hashtag = $1
        ORDER BY created_at ASC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(messagesQuery, [hashtag, limit, offset]);
      res.json(result.rows);
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  // Отправить сообщение в комнату по хэштегу
  async sendHashtagMessage(req, res) {
    try {
      const { roomId } = req.params;
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:       const { message, user_id, username, reply_to } = req.body;
      
      // Получаем хэштег комнаты
      const roomQuery = 'SELECT hashtag FROM hashtag_chat_rooms WHERE id = $1';
      const roomResult = await pool.query(roomQuery, [roomId]);
      
      if (roomResult.rows.length === 0) {
        return res.status(404).json({ error: 'Room not found' });
      }
      
      const hashtag = roomResult.rows[0].hashtag;
      // Сохраняем сообщение
      const insertQuery = `
        INSERT INTO hashtag_chat_messages (hashtag, message, user_id, image_url)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const result = await pool.query(insertQuery, [hashtag, message, user_id, null]);
      
      // Обновляем last_activity в комнате
      await pool.query(
        'UPDATE hashtag_chat_rooms SET last_activity = NOW() WHERE id = $1',
        [roomId]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
}

export default new ChatController(); 


