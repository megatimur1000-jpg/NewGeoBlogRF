import pool from './src/database/config.js';

class Activity {
  static async getStats(user_id) {
    try {
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM activity_feed WHERE is_public = true) as total_activities,
          (SELECT COUNT(*) FROM activity_feed af
           LEFT JOIN activity_read_status ars ON af.id = ars.activity_id AND ars.user_id = $1
           WHERE af.is_public = true AND (ars.is_read = false OR ars.is_read IS NULL)) as unread_activities,
          (SELECT COUNT(*) FROM activity_feed 
           WHERE is_public = true AND activity_type IN ('chat_created', 'chat_joined', 'friend_request_accepted')) as messages_count,
          (SELECT COUNT(*) FROM activity_feed 
           WHERE is_public = true AND activity_type IN ('system_maintenance', 'system_update_available', 'system_update_completed', 'system_feature_added', 'system_feature_removed', 'system_security_alert', 'system_performance_boost')) as system_count
      `;
      
      const result = await pool.query(query, [user_id]);
      return result.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }
}

async function testActivityStats() {
  try {
    // Получаем первого пользователя
    const userResult = await pool.query('SELECT id FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      console.log('No users found in database');
      return;
    }
    
    const user_id = userResult.rows[0].id;
    console.log('Using user_id:', user_id);
    
    // Тестируем запрос статистики через метод класса
    console.log('Calling Activity.getStats with user_id:', user_id);
    const stats = await Activity.getStats(user_id);
    
    console.log('Activity.getStats result:', stats);
    
  } catch (error) {
    console.error('Error in testActivityStats:', error);
  } finally {
    console.log('Test completed');
    process.exit(0);
  }
}

testActivityStats();