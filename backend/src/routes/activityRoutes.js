import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getActivityFeed,
  getActivityStats,
  createActivity,
  markAsRead,
  markAllAsRead,
  getPrivacySettings,
  updatePrivacySettings,
  deleteActivity
} from '../controllers/activityController.js';

const router = express.Router();

// Все маршруты требуют авторизации
router.use(authenticateToken);

// GET /api/activity - получить ленту активности
router.get('/', getActivityFeed);

// GET /api/activity/stats - получить статистику активности
router.get('/stats', getActivityStats);

// POST /api/activity - создать активность (для внутреннего использования)
router.post('/', createActivity);

// PUT /api/activity/:id/read - отметить активность как прочитанную
router.put('/:id/read', markAsRead);

// PUT /api/activity/read-all - отметить все активности как прочитанные
router.put('/read-all', markAllAsRead);

// GET /api/activity/privacy - получить настройки приватности
router.get('/privacy', getPrivacySettings);

// PUT /api/activity/privacy - обновить настройки приватности
router.put('/privacy', updatePrivacySettings);

// DELETE /api/activity/:id - удалить активность
router.delete('/:id', deleteActivity);

export default router;
