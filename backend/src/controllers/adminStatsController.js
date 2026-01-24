import pool from '../../db.js';

/**
 * Контроллер статистики для админ-панели
 * Полная аналитика проекта: пользователи, контент, активность, тенденции
 */

// Получить общую статистику проекта
export const getProjectStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    // Проверяем права администратора
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Требуются права администратора.' });
    }

    // Общая статистика пользователей
    const usersStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE role = 'admin') as admins,
        COUNT(*) FILTER (WHERE role = 'registered') as registered,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_last_week,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_last_month
      FROM users
    `);

    // Статистика контента по типам
    const contentStats = await pool.query(`
      SELECT 
        'events' as type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_last_week,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_last_month
      FROM events
      UNION ALL
      SELECT 
        'posts' as type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_last_week,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_last_month
      FROM posts
      UNION ALL
      SELECT 
        'routes' as type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_last_week,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_last_month
      FROM travel_routes
      UNION ALL
      SELECT 
        'markers' as type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_last_week,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_last_month
      FROM map_markers
      UNION ALL
      SELECT 
        'blogs' as type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_last_week,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_last_month
      FROM blog_posts
    `);

    // Статистика модерации ИИ
    const aiModerationStats = await pool.query(`
      SELECT 
        COUNT(*) as total_decisions,
        COUNT(*) FILTER (WHERE admin_verdict = 'pending') as pending_verdicts,
        COUNT(*) FILTER (WHERE admin_verdict = 'correct') as correct_verdicts,
        COUNT(*) FILTER (WHERE admin_verdict = 'incorrect') as incorrect_verdicts,
        COUNT(*) FILTER (WHERE ai_suggestion = 'approve') as ai_approved,
        COUNT(*) FILTER (WHERE ai_suggestion = 'reject') as ai_rejected,
        AVG(ai_confidence) as avg_confidence,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_last_week
      FROM ai_moderation_decisions
    `);

    // Статистика геймификации
    const gamificationStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT user_id) as users_with_xp,
        SUM(total_xp) as total_xp_awarded,
        AVG(total_xp) as avg_xp_per_user,
        COUNT(*) FILTER (WHERE current_level >= 10) as high_level_users,
        COUNT(*) FILTER (WHERE current_level >= 5) as mid_level_users
      FROM user_levels
    `);

    // Топ активных пользователей
    const topUsers = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        ul.total_xp,
        ul.current_level,
        ul.rank,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as posts_count,
        COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'active') as events_count,
        COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'active') as routes_count
      FROM users u
      LEFT JOIN user_levels ul ON u.id = ul.user_id
      LEFT JOIN posts p ON p.author_id::text = u.id::text
      LEFT JOIN events e ON e.creator_id = u.id
      LEFT JOIN travel_routes r ON r.creator_id = u.id
      WHERE u.role != 'admin'
      GROUP BY u.id, u.username, u.email, ul.total_xp, ul.current_level, ul.rank
      ORDER BY ul.total_xp DESC NULLS LAST
      LIMIT 10
    `);

    // Статистика по дням (последние 30 дней)
    const dailyStats = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_content
      FROM (
        SELECT created_at FROM events
        UNION ALL
        SELECT created_at FROM posts
        UNION ALL
        SELECT created_at FROM travel_routes
        UNION ALL
        SELECT created_at FROM map_markers
        UNION ALL
        SELECT created_at FROM blog_posts
      ) as all_content
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      users: usersStats.rows[0],
      content: contentStats.rows,
      aiModeration: aiModerationStats.rows[0],
      gamification: gamificationStats.rows[0],
      topUsers: topUsers.rows,
      dailyStats: dailyStats.rows
    });
  } catch (error) {
    console.error('Ошибка получения статистики проекта:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении статистики.' });
  }
};

// Получить детальную статистику пользователя
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { targetUserId } = req.params;

    // Проверяем права администратора
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Требуются права администратора.' });
    }

    // Информация о пользователе
    const userInfo = await pool.query(`
      SELECT u.*, ul.total_xp, ul.current_level, ul.rank
      FROM users u
      LEFT JOIN user_levels ul ON u.id = ul.user_id
      WHERE u.id = $1
    `, [targetUserId]);

    if (userInfo.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден.' });
    }

    // Контент пользователя
    const userContent = await pool.query(`
      SELECT 
        'posts' as type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
      FROM posts
      WHERE author_id::text = $1
      UNION ALL
      SELECT 
        'events' as type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
      FROM events
      WHERE creator_id = $1
      UNION ALL
      SELECT 
        'routes' as type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
      FROM travel_routes
      WHERE creator_id = $1
    `, [targetUserId]);

    // История XP
    const xpHistory = await pool.query(`
      SELECT source, SUM(amount) as total_xp, COUNT(*) as actions_count
      FROM xp_history
      WHERE user_id = $1
      GROUP BY source
      ORDER BY total_xp DESC
    `, [targetUserId]);

    res.json({
      user: userInfo.rows[0],
      content: userContent.rows,
      xpHistory: xpHistory.rows
    });
  } catch (error) {
    console.error('Ошибка получения статистики пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера.' });
  }
};

// Получить тенденции (рост/падение)
export const getTrends = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    // Проверяем права администратора
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Требуются права администратора.' });
    }

    // Сравнение последних 7 дней с предыдущими 7 днями
    const trends = await pool.query(`
      SELECT 
        'users' as metric,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as current_period,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '14 days' AND created_at <= NOW() - INTERVAL '7 days') as previous_period
      FROM users
      UNION ALL
      SELECT 
        'content' as metric,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as current_period,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '14 days' AND created_at <= NOW() - INTERVAL '7 days') as previous_period
      FROM (
        SELECT created_at FROM events
        UNION ALL
        SELECT created_at FROM posts
        UNION ALL
        SELECT created_at FROM travel_routes
        UNION ALL
        SELECT created_at FROM map_markers
        UNION ALL
        SELECT created_at FROM blog_posts
      ) as all_content
    `);

    // Рассчитываем процент изменения
    const trendsWithChange = trends.rows.map(trend => {
      const current = parseInt(trend.current_period) || 0;
      const previous = parseInt(trend.previous_period) || 0;
      const change = previous > 0 ? ((current - previous) / previous * 100) : (current > 0 ? 100 : 0);
      
      return {
        ...trend,
        change: Math.round(change * 100) / 100,
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      };
    });

    res.json({ trends: trendsWithChange });
  } catch (error) {
    console.error('Ошибка получения тенденций:', error);
    res.status(500).json({ message: 'Ошибка сервера.' });
  }
};

