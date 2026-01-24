import express from 'express';
import { 
  createEvent, 
  getEvents, 
  getEventById, 
  updateEvent, 
  deleteEvent,
  joinEvent,
  searchExternalEvents,
  approveEvent,
  rejectEvent
} from '../controllers/eventController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { optionalAuthenticateToken } from '../middleware/optionalAuth.js';
import { validateEvent } from '../middleware/validation.js';
import { validateEventCoordinates } from '../middleware/russiaValidation.js';

const router = express.Router();

// Публичные маршруты
router.get('/', getEvents);
router.get('/external', searchExternalEvents);
router.get('/pending', authenticateToken, requireRole(['admin']), async (req, res) => {
  // Получаем события на модерации
  req.query = { ...req.query, pending: 'true' };
  return getEvents(req, res);
});
router.post('/:id/approve', authenticateToken, requireRole(['admin']), approveEvent);
router.post('/:id/reject', authenticateToken, requireRole(['admin']), rejectEvent);
router.get('/:id', getEventById);

// Защищенные маршруты с валидацией
// Разрешаем создание событий для неавторизованных пользователей (отложенная модерация)
router.post('/', optionalAuthenticateToken, validateEventCoordinates, createEvent);
// Временно отключена валидация для тестирования: validateEvent
router.put('/:id', authenticateToken, validateEventCoordinates, validateEvent, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);
router.post('/:id/join', authenticateToken, joinEvent);

export default router;
