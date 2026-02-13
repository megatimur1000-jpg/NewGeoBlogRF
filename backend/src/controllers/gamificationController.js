import pool from '../../db.js';
import { calculateLevelFromTotalXP } from '../utils/xpCalculator.js';
import logger from '../../logger.js';


/**
 * Определить этап геймификации на основе количества пользователей
 */
function getGamificationStage(userCount) {
  if (userCount < 50) return 1;
  if (userCount < 200) return 2;
  if (userCount < 500) return 3;
  return 4;
}

/**
 * Получить активные функции для этапа
 */
function getActiveFeatures(stage) {
  return {
    basicLevels: true,
    basicXP: true,
    basicAchievements: true,
    dailyGoals: stage >= 2,
    qualityAchievements: stage >= 2,
    streak: stage >= 2,
    leaderboards: stage >= 3,
    specialEvents: stage >= 3,
    advancedBoosts: stage >= 4,
  };
}

/**
 * Получить уровень пользователя
 */
export const getUserLevel = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Получаем или создаём уровень пользователя
    let result = await pool.query(
      'SELECT * FROM user_levels WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Создаём начальный уровень
      await pool.query(
        `INSERT INTO user_levels (user_id, total_xp, current_level, current_level_xp, required_xp, rank)
         VALUES ($1, 0, 1, 0, 100, 'novice')`,
        [userId]
      );
      
      result = await pool.query(
        'SELECT * FROM user_levels WHERE user_id = $1',
        [userId]
      );
    }

    const levelData = result.rows[0];
    
    // Рассчитываем прогресс
    const progress = levelData.required_xp > 0 
      ? (levelData.current_level_xp / levelData.required_xp) * 100 
      : 100;

    res.json({
      level: levelData.current_level,
      currentXP: levelData.current_level_xp,
      requiredXP: levelData.required_xp,
      totalXP: levelData.total_xp,
      rank: levelData.rank,
      progress: Math.min(100, Math.max(0, progress)),
    });
  } catch (error) {
    logger.error('getUserLevel error:', error);
    res.status(500).json({ error: 'Failed to get user level' });
  }
};

/**
 * Добавить XP пользователю
 */
export const addXP = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { source, amount, contentId, contentType, metadata } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!source || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid XP parameters' });
    }

    // Проверяем уникальность действия (защита от накруток)
    if (contentId) {
      const existingAction = await pool.query(
        'SELECT id FROM gamification_actions WHERE user_id = $1 AND source = $2 AND content_id = $3',
        [userId, source, contentId]
      );

      if (existingAction.rows.length > 0) {
        return res.status(400).json({ error: 'Duplicate action', reason: 'duplicate' });
      }
    }

    // Получаем текущий уровень
    let levelResult = await pool.query(
      'SELECT * FROM user_levels WHERE user_id = $1',
      [userId]
    );

    if (levelResult.rows.length === 0) {
      // Создаём начальный уровень
      await pool.query(
        `INSERT INTO user_levels (user_id, total_xp, current_level, current_level_xp, required_xp, rank)
         VALUES ($1, 0, 1, 0, 100, 'novice')`,
        [userId]
      );
      
      levelResult = await pool.query(
        'SELECT * FROM user_levels WHERE user_id = $1',
        [userId]
      );
    }

    const currentLevel = levelResult.rows[0];
    const newTotalXP = currentLevel.total_xp + amount;
    
    // Рассчитываем новый уровень
    const newLevelData = calculateLevelFromTotalXP(newTotalXP);
    
    // Обновляем уровень пользователя
    await pool.query(
      `UPDATE user_levels 
       SET total_xp = $1, current_level = $2, current_level_xp = $3, 
           required_xp = $4, rank = $5, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6`,
      [
        newTotalXP,
        newLevelData.level,
        newLevelData.currentLevelXP,
        newLevelData.requiredXP,
        newLevelData.rank,
        userId
      ]
    );

    // Записываем в историю XP
    await pool.query(
      `INSERT INTO xp_history (user_id, source, amount, content_id, content_type, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, source, amount, contentId || null, contentType || null, JSON.stringify(metadata || {})]
    );

    // Записываем действие для проверки уникальности
    if (contentId) {
      await pool.query(
        `INSERT INTO gamification_actions (user_id, source, content_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, source, content_id) DO NOTHING`,
        [userId, source, contentId]
      );
    }

    const levelUp = newLevelData.level > currentLevel.current_level;

    res.json({
      success: true,
      newLevel: newLevelData.level,
      levelUp,
      totalXP: newTotalXP,
      currentLevelXP: newLevelData.currentLevelXP,
      requiredXP: newLevelData.requiredXP,
    });
  } catch (error) {
    logger.error('addXP error:', error);
    res.status(500).json({ error: 'Failed to add XP', details: error.message });
  }
};

/**
 * Получить ежедневные цели
 */
export const getDailyGoals = async (req, res) => {
  try {
    const userId = req.user?.id;
    const today = new Date().toISOString().split('T')[0];

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Получаем цели на сегодня
    let goals = await pool.query(
      'SELECT * FROM daily_goals WHERE user_id = $1 AND date = $2 ORDER BY created_at',
      [userId, today]
    );

    // Если целей нет, создаём новые (это должно быть в отдельной функции генерации)
    if (goals.rows.length === 0) {
      // TODO: Генерация целей (пока возвращаем пустой массив)
      return res.json({ goals: [] });
    }

    res.json({ goals: goals.rows });
  } catch (error) {
    logger.error('getDailyGoals error:', error);
    res.status(500).json({ error: 'Failed to get daily goals' });
  }
};

/**
 * Выполнить цель
 */
export const completeGoal = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { goalId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Обновляем цель
    const result = await pool.query(
      `UPDATE daily_goals 
       SET completed = TRUE, current = target, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND goal_id = $2 AND date = $3
       RETURNING *`,
      [userId, goalId, today]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const goal = result.rows[0];

    // Добавляем XP за выполнение цели
    if (goal.xp_reward > 0) {
      // Вызываем addXP через внутренний механизм
      // (упрощённая версия, в реальности лучше использовать общую функцию)
      const levelResult = await pool.query(
        'SELECT * FROM user_levels WHERE user_id = $1',
        [userId]
      );

      if (levelResult.rows.length > 0) {
        const currentLevel = levelResult.rows[0];
        const newTotalXP = currentLevel.total_xp + goal.xp_reward;
        const newLevelData = calculateLevelFromTotalXP(newTotalXP);

        await pool.query(
          `UPDATE user_levels 
           SET total_xp = $1, current_level = $2, current_level_xp = $3, 
               required_xp = $4, rank = $5, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $6`,
          [
            newTotalXP,
            newLevelData.level,
            newLevelData.currentLevelXP,
            newLevelData.requiredXP,
            newLevelData.rank,
            userId
          ]
        );
      }
    }

    res.json({ success: true, goal: result.rows[0] });
  } catch (error) {
    logger.error('completeGoal error:', error);
    res.status(500).json({ error: 'Failed to complete goal' });
  }
};

/**
 * Получить награду за день
 */
export const claimDailyReward = async (req, res) => {
  try {
    const userId = req.user?.id;
    const today = new Date().toISOString().split('T')[0];

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Проверяем, все ли цели выполнены
    const goals = await pool.query(
      'SELECT * FROM daily_goals WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    if (goals.rows.length === 0) {
      return res.status(400).json({ error: 'No goals found' });
    }

    const allCompleted = goals.rows.every(g => g.completed);

    if (!allCompleted) {
      return res.status(400).json({ error: 'Not all goals completed' });
    }

    // Проверяем, не получена ли уже награда
    const history = await pool.query(
      'SELECT * FROM daily_goals_history WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    if (history.rows.length > 0 && history.rows[0].reward_claimed) {
      return res.status(400).json({ error: 'Reward already claimed' });
    }

    // Рассчитываем бонус XP (50% от всех целей)
    const totalXP = goals.rows.reduce((sum, g) => sum + g.xp_reward, 0);
    const bonusXP = Math.floor(totalXP * 0.5);

    // Добавляем бонус XP
    const levelResult = await pool.query(
      'SELECT * FROM user_levels WHERE user_id = $1',
      [userId]
    );

    if (levelResult.rows.length > 0) {
      const currentLevel = levelResult.rows[0];
      const newTotalXP = currentLevel.total_xp + bonusXP;
      const newLevelData = calculateLevelFromTotalXP(newTotalXP);

      await pool.query(
        `UPDATE user_levels 
         SET total_xp = $1, current_level = $2, current_level_xp = $3, 
             required_xp = $4, rank = $5, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $6`,
        [
          newTotalXP,
          newLevelData.level,
          newLevelData.currentLevelXP,
          newLevelData.requiredXP,
          newLevelData.rank,
          userId
        ]
      );
    }

    // Обновляем историю
    await pool.query(
      `INSERT INTO daily_goals_history (user_id, date, all_completed, reward_claimed, streak)
       VALUES ($1, $2, TRUE, TRUE, 
         COALESCE((SELECT streak FROM daily_goals_history WHERE user_id = $1 AND date = $3 ORDER BY date DESC LIMIT 1), 0) + 1)
       ON CONFLICT (user_id, date) 
       DO UPDATE SET all_completed = TRUE, reward_claimed = TRUE, streak = 
         COALESCE((SELECT streak FROM daily_goals_history WHERE user_id = $1 AND date = $3 ORDER BY date DESC LIMIT 1), 0) + 1`,
      [userId, today, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]]
    );

    res.json({ success: true, bonusXP });
  } catch (error) {
    logger.error('claimDailyReward error:', error);
    res.status(500).json({ error: 'Failed to claim daily reward' });
  }
};

/**
 * Получить достижения
 */
export const getAchievements = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Получаем достижения пользователя
    const achievements = await pool.query(
      'SELECT * FROM user_achievements WHERE user_id = $1',
      [userId]
    );

    res.json({ achievements: achievements.rows });
  } catch (error) {
    logger.error('getAchievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
};

/**
 * Получить статистику
 */
/**
 * Получить feature flags и количество пользователей
 */
export const getFeatures = async (req, res) => {
  try {
    // Получаем количество пользователей
    const userCountResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(userCountResult.rows[0].count) || 0;
    
    // Определяем этап
    const stage = getGamificationStage(userCount);
    
    // Получаем активные функции
    const features = getActiveFeatures(stage);
    
    res.json({
      features,
      stage,
      userCount,
    });
  } catch (error) {
    logger.error('getFeatures error:', error);
    res.status(500).json({ 
      error: 'Failed to get features',
      features: getActiveFeatures(1), // Fallback к этапу 1
      stage: 1,
      userCount: 0,
    });
  }
};

/**
 * Ретроактивное начисление XP и достижений для гостя при регистрации
 */
export const applyRetroactiveGamification = async (req, res) => {
  try {
    const { guestId, userId } = req.body;
    const currentUserId = req.user?.id || userId;
    
    if (!guestId || !currentUserId) {
      return res.status(400).json({ error: 'guestId and userId required' });
    }
    
    // TODO: Получить одобренные действия гостя из БД
    // Пока используем логику из frontend
    // В будущем можно хранить действия гостей в БД
    
    // Получаем уровень пользователя после начисления
    const levelResult = await pool.query(
      'SELECT * FROM user_levels WHERE user_id = $1',
      [currentUserId]
    );
    
    const levelData = levelResult.rows[0] || {
      current_level: 1,
      total_xp: 0,
      rank: 'novice',
    };
    
    res.json({
      success: true,
      level: levelData.current_level,
      totalXP: levelData.total_xp,
      rank: levelData.rank,
      message: 'Retroactive gamification applied',
    });
  } catch (error) {
    logger.error('applyRetroactiveGamification error:', error);
    res.status(500).json({ error: 'Failed to apply retroactive gamification' });
  }
};

/**
 * Отметить действие гостя как одобренное (вызывается модератором)
 */
export const markGuestActionAsApproved = async (req, res) => {
  try {
    const { contentId, actionType } = req.body;
    
    if (!contentId || !actionType) {
      return res.status(400).json({ error: 'contentId and actionType required' });
    }
    
    // TODO: Сохранить в БД, что действие одобрено
    // Пока это делается на frontend через localStorage
    // В будущем можно хранить в таблице guest_actions
    
    res.json({
      success: true,
      message: 'Guest action marked as approved',
    });
  } catch (error) {
    logger.error('markGuestActionAsApproved error:', error);
    res.status(500).json({ error: 'Failed to mark guest action as approved' });
  }
};

export const getStats = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Получаем уровень
    const levelResult = await pool.query(
      'SELECT * FROM user_levels WHERE user_id = $1',
      [userId]
    );

    // Получаем достижения
    const achievementsResult = await pool.query(
      'SELECT * FROM user_achievements WHERE user_id = $1',
      [userId]
    );

    // Получаем стрик
    const today = new Date().toISOString().split('T')[0];
    const historyResult = await pool.query(
      'SELECT * FROM daily_goals_history WHERE user_id = $1 ORDER BY date DESC LIMIT 1',
      [userId]
    );

    // Получаем цели на сегодня
    const goalsResult = await pool.query(
      'SELECT * FROM daily_goals WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    const level = levelResult.rows[0] || null;
    const achievements = achievementsResult.rows || [];
    const streak = historyResult.rows[0]?.streak || 0;
    const goals = goalsResult.rows || [];
    const todayProgress = goals.length > 0 
      ? (goals.filter(g => g.completed).length / goals.length) * 100 
      : 0;

    res.json({
      userLevel: level ? {
        level: level.current_level,
        currentXP: level.current_level_xp,
        requiredXP: level.required_xp,
        totalXP: level.total_xp,
        rank: level.rank,
        progress: level.required_xp > 0 
          ? (level.current_level_xp / level.required_xp) * 100 
          : 100,
      } : null,
      achievements: {
        total: achievements.length,
        unlocked: achievements.filter(a => a.unlocked).length,
        byRarity: {}, // TODO: группировка по редкости
      },
      dailyGoals: {
        current: goals,
        streak,
        todayProgress,
      },
      recentXP: [], // TODO: последние XP из истории
    });
  } catch (error) {
    logger.error('getStats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

