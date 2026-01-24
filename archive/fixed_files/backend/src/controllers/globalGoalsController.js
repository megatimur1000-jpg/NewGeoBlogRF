// SONAR-AUTO-FIX (javascript:S1128): original: // SONAR-AUTO-FIX (javascript:S1128): original: // SONAR-AUTO-FIX (javascript:S1128): original: import pool from '../../db.js';

/**
 * Получить все активные глобальные цели
 */
export const getGlobalGoals = async (req, res) => {
  try {
    // TODO: Получать из БД, пока используем моковые данные
    const goals = [
      {
        id: 'discover_russia',
        title: 'Откройте Россию вместе',
        description: 'Создайте 10,000 уникальных меток по всей стране',
        target: 10000,
        current: 3847,
        reward: {
          type: 'badge',
          name: 'Исследователь России',
          description: 'Эксклюзивный значок за вклад в открытие России',
        },
        deadline: '2025-12-31',
        announcement: 'Если мы достигнем этой цели до Нового года, все получат специальный ранг!',
        category: 'places',
        icon: 'map',
      },
      {
        id: 'winter_adventures',
        title: 'Зимние приключения',
        description: '1,000 постов с хэштегом #ЗимаВМоскве',
        target: 1000,
        current: 650,
        reward: {
          type: 'boost',
          name: 'Буст XP на 24 часа',
          description: 'Все участники получат +50% XP на 24 часа',
        },
        deadline: '2025-02-28',
        announcement: 'Только до конца февраля!',
        category: 'posts',
        icon: 'snowflake',
        isTemporary: true,
      },
      {
        id: 'geoblog_1000',
        title: 'ГеоБлог 1000',
        description: '1,000 активных пользователей в месяц',
        target: 1000,
        current: 678,
        reward: {
          type: 'feature',
          name: 'Платные гиды',
          description: 'Откроется раздел для всех создателей маршрутов',
        },
        deadline: null,
        announcement: 'Достигнем цели — и каждый сможет зарабатывать на своих маршрутах!',
        category: 'users',
        icon: 'users',
      },
    ];

    // Рассчитываем прогресс для каждой цели
    const goalsWithProgress = goals.map(goal => ({
      ...goal,
      progress: Math.min(100, (goal.current / goal.target) * 100),
      remaining: Math.max(0, goal.target - goal.current),
      isCompleted: goal.current >= goal.target,
    }));

    res.json({
      goals: goalsWithProgress,
      total: goalsWithProgress.length,
      active: goalsWithProgress.filter(g => !g.isCompleted).length,
    });
  } catch (error) {
    console.error('getGlobalGoals error:', error);
    res.status(500).json({ error: 'Failed to get global goals' });
  }
};

/**
 * Обновить прогресс глобальной цели
 * Вызывается автоматически при создании поста/метки
 */
export const updateGlobalGoalProgress = async (req, res) => {
  try {
// SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1481): original:     const { goalId, actionType, amount = 1 } = req.body;

    if (!goalId || !actionType) {
      return res.status(400).json({ error: 'goalId and actionType required' });
    }

    // TODO: Обновить прогресс в БД
    // Пока просто возвращаем успех
    
    res.json({
      success: true,
      message: 'Global goal progress updated',
    });
  } catch (error) {
    console.error('updateGlobalGoalProgress error:', error);
    res.status(500).json({ error: 'Failed to update global goal progress' });
  }
};

/**
 * Получить статистику для глобальных целей
 */
export const getGlobalGoalsStats = async (req, res) => {
  try {
    // TODO: Получать реальную статистику из БД
    const stats = {
      totalMarkers: 3847,
      totalPosts: 1250,
      totalUsers: 678,
      activeGoals: 3,
      completedGoals: 0,
    };

    res.json(stats);
  } catch (error) {
    console.error('getGlobalGoalsStats error:', error);
    res.status(500).json({ error: 'Failed to get global goals stats' });
  }
};




