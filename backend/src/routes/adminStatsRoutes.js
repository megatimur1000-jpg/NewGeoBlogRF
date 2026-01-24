import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getProjectStats, getUserStats, getTrends } from '../controllers/adminStatsController.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authenticateToken);

// Общая статистика проекта
router.get('/stats/project', getProjectStats);

// Статистика конкретного пользователя
router.get('/stats/user/:targetUserId', getUserStats);

// Тенденции (рост/падение)
router.get('/stats/trends', getTrends);

export default router;

