// backend/src/routes/chat.js
import express from 'express';
const router = express.Router();
import chatController from '../controllers/chatController.js';
// SONAR-AUTO-FIX (javascript:S1128): original: // SONAR-AUTO-FIX (javascript:S1128): original: // SONAR-AUTO-FIX (javascript:S1128): original: import { authenticateToken } from '../middleware/auth.js';
import { Pool } from 'pg';
import databaseConfig from '../../database.config.simple.cjs';

const pool = new Pool(databaseConfig);

// Получить все чаты пользователя
router.get('/user/:userId', chatController.getUserChats);

// Получить все комнаты по хэштегам
router.get('/hashtag-rooms', chatController.getHashtagRooms);

// Получить удалённые чаты пользователя (приватная корзина)
router.get('/deleted-rooms', chatController.getDeletedRooms);

// Архивировать чат
router.post('/archive/:roomId', chatController.archiveChat);

// Удалить чат (мягкое удаление)
router.post('/delete/:roomId', chatController.deleteChat);

// Восстановить удалённый чат
router.post('/restore/:roomId', chatController.restoreChat);

// Раскомментировать чат
router.post('/unarchive/:roomId', chatController.unarchiveChat);

// Отладочный роут для проверки
router.get('/test', (req, res) => {
  res.json({ message: 'Chat routes are working!' });
});

// Простой тест для сообщений
router.get('/test-messages', async (req, res) => {
  try {
    // Простой запрос без сложной логики
    const result = await pool.query('SELECT * FROM hashtag_chat_messages LIMIT 3');
    
    res.json({
      message: 'Test successful',
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить сообщения чата
router.get('/rooms/:roomId/messages', chatController.getChatMessages);

// Получить сообщения комнаты по хэштегу
router.get('/hashtag-rooms/:roomId/messages', chatController.getHashtagRoomMessages);

// Отправить сообщение в комнату по хэштегу
router.post('/hashtag-rooms/:roomId/messages', chatController.sendHashtagMessage);

// Отправить сообщение
router.post('/messages', chatController.sendMessage);

// Создать новый чат
router.post('/rooms', chatController.createChat);

// Добавить участника в чат
router.post('/rooms/:roomId/participants', chatController.addParticipant);

// Удалить участника из чата
router.delete('/rooms/:roomId/participants/:userId', chatController.removeParticipant);

// Получить участников чата
router.get('/rooms/:roomId/participants', chatController.getChatParticipants);

// Обновить роль участника
router.put('/rooms/:roomId/participants/:userId/role', chatController.updateParticipantRole);

// Отметить сообщения как прочитанные
router.put('/rooms/:roomId/read/:userId', chatController.markAsRead);

// Добавить реакцию на сообщение
router.post('/messages/:messageId/reactions', chatController.addReaction);

// Удалить реакцию
router.delete('/messages/:messageId/reactions/:userId', chatController.removeReaction);

// Получить комнату по hashtag (для интеграции с картой)
router.get('/rooms', async (req, res) => {
  const { hashtag } = req.query;
  if (!hashtag) {
    return res.status(400).json({ error: 'hashtag required' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM hashtag_chat_rooms WHERE hashtag = $1',
      [hashtag]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;



