import express from 'express';
import {
  getGlobalGoals,
  updateGlobalGoalProgress,
  getGlobalGoalsStats,
} from '../controllers/globalGoalsController.js';

const router = express.Router();

// Публичные endpoints (не требуют аутентификации)
router.get('/global-goals', getGlobalGoals);
router.get('/global-goals/stats', getGlobalGoalsStats);

// Обновление прогресса (требует аутентификации)
router.post('/global-goals/:goalId/progress', updateGlobalGoalProgress);

export default router;

