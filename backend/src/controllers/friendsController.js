import pool from '../../db.js';

class FriendsController {
  // Получить список друзей пользователя
  async getFriends(req, res) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      
      const query = `
        SELECT 
          f.id,
          f.status,
          f.created_at,
          f.accepted_at,
          u.id as friend_id,
          u.username,
          u.email,
          u.avatar_url,
          u.last_seen,
          CASE 
            WHEN u.last_seen > NOW() - INTERVAL '5 minutes' THEN 'online'
            WHEN u.last_seen > NOW() - INTERVAL '1 hour' THEN 'recently'
            ELSE 'offline'
          END as status
        FROM friends f
        JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id)
        WHERE (f.user_id = $1 OR f.friend_id = $1)
        AND f.status = 'accepted'
        AND u.id != $1
        ORDER BY u.last_seen DESC NULLS LAST, u.username ASC
      `;
      
      const result = await pool.query(query, [userId]);
      res.json(result.rows);
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  // Получить входящие заявки в друзья
  async getIncomingRequests(req, res) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      
      const query = `
        SELECT 
          fr.id,
          fr.message,
          fr.created_at,
          u.id as from_user_id,
          u.username,
          u.email,
          u.avatar_url
        FROM friend_requests fr
        JOIN users u ON fr.from_user_id = u.id
        WHERE fr.to_user_id = $1
        ORDER BY fr.created_at DESC
      `;
      
      const result = await pool.query(query, [userId]);
      res.json(result.rows);
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  // Получить исходящие заявки в друзья
  async getOutgoingRequests(req, res) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      
      const query = `
        SELECT 
          fr.id,
          fr.message,
          fr.created_at,
          u.id as to_user_id,
          u.username,
          u.email,
          u.avatar_url
        FROM friend_requests fr
        JOIN users u ON fr.to_user_id = u.id
        WHERE fr.from_user_id = $1
        ORDER BY fr.created_at DESC
      `;
      
      const result = await pool.query(query, [userId]);
      res.json(result.rows);
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  // Отправить заявку в друзья
  async sendFriendRequest(req, res) {
    try {
      const { fromUserId, toUserId, message } = req.body;
      
      if (!fromUserId || !toUserId) {
        return res.status(400).json({ error: 'fromUserId and toUserId required' });
      }
      
      if (fromUserId === toUserId) {
        return res.status(400).json({ error: 'Cannot send friend request to yourself' });
      }
      
      // Проверяем, не друзья ли уже
      const existingFriendship = await pool.query(
        'SELECT id, status FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
        [fromUserId, toUserId]
      );
      
      if (existingFriendship.rows.length > 0) {
        const friendship = existingFriendship.rows[0];
        if (friendship.status === 'accepted') {
          return res.status(400).json({ error: 'Users are already friends' });
        } else if (friendship.status === 'pending') {
          return res.status(400).json({ error: 'Friend request already sent' });
        }
      }
      
      // Проверяем, не отправляли ли уже заявку
      const existingRequest = await pool.query(
        'SELECT id FROM friend_requests WHERE from_user_id = $1 AND to_user_id = $2',
        [fromUserId, toUserId]
      );
      
      if (existingRequest.rows.length > 0) {
        return res.status(400).json({ error: 'Friend request already sent' });
      }
      
      // Отправляем заявку
      const result = await pool.query(
        'INSERT INTO friend_requests (from_user_id, to_user_id, message) VALUES ($1, $2, $3) RETURNING *',
        [fromUserId, toUserId, message || null]
      );
      
      res.status(201).json({ 
        message: 'Friend request sent successfully', 
        request: result.rows[0] 
      });
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Принять заявку в друзья
  async acceptFriendRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { userId } = req.body; // ID пользователя, который принимает заявку
      
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      
      // Получаем информацию о заявке
      const requestQuery = await pool.query(
        'SELECT * FROM friend_requests WHERE id = $1 AND to_user_id = $2',
        [requestId, userId]
      );
      
      if (requestQuery.rows.length === 0) {
        return res.status(404).json({ error: 'Friend request not found' });
      }
      
      const request = requestQuery.rows[0];
      
      // Создаём дружбу
      await pool.query(
        'INSERT INTO friends (user_id, friend_id, status, created_at, accepted_at) VALUES ($1, $2, $3, $4, $5)',
        [request.from_user_id, request.to_user_id, 'accepted', request.created_at, new Date()]
      );
      
      // Удаляем заявку
      await pool.query('DELETE FROM friend_requests WHERE id = $1', [requestId]);
      
      res.json({ message: 'Friend request accepted successfully' });
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Отклонить заявку в друзья
  async rejectFriendRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      
      const result = await pool.query(
        'DELETE FROM friend_requests WHERE id = $1 AND to_user_id = $2 RETURNING *',
        [requestId, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Friend request not found' });
      }
      
      res.json({ message: 'Friend request rejected successfully' });
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Удалить из друзей
  async removeFriend(req, res) {
    try {
      const { friendshipId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      
      const result = await pool.query(
        'DELETE FROM friends WHERE id = $1 AND (user_id = $2 OR friend_id = $2) RETURNING *',
        [friendshipId, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Friendship not found' });
      }
      
      res.json({ message: 'Friend removed successfully' });
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Поиск пользователей для добавления в друзья
  async searchUsers(req, res) {
    try {
      const { userId, query } = req.query;
      
      if (!userId || !query) {
        return res.status(400).json({ error: 'userId and query required' });
      }
      
      const searchQuery = `
        SELECT 
          u.id,
          u.username,
          u.email,
          u.avatar_url,
          u.last_seen,
          CASE 
            WHEN f.status = 'accepted' THEN 'friend'
            WHEN fr.id IS NOT NULL THEN 'request_sent'
            WHEN fr_incoming.id IS NOT NULL THEN 'request_received'
            ELSE 'none'
          END as relationship_status
        FROM users u
        LEFT JOIN friends f ON (f.user_id = u.id OR f.friend_id = u.id) 
          AND (f.user_id = $1 OR f.friend_id = $1)
        LEFT JOIN friend_requests fr ON fr.from_user_id = $1 AND fr.to_user_id = u.id
        LEFT JOIN friend_requests fr_incoming ON fr_incoming.to_user_id = $1 AND fr_incoming.from_user_id = u.id
        WHERE u.id != $1
        AND (u.username ILIKE $2 OR u.email ILIKE $2)
        ORDER BY u.username ASC
        LIMIT 20
      `;
      
      const result = await pool.query(searchQuery, [userId, `%${query}%`]);
      res.json(result.rows);
    } catch (error) {
      
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
}

export default new FriendsController();

