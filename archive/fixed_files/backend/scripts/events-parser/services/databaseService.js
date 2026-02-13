const { Pool } = require('pg');
const logger = require('../../wayatom-parser/utils/logger');

// Создаем пул подключений напрямую
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'bestsite',
  user: 'bestuser_temp',
  password: '55555',
});

class DatabaseService {
  async insertEvent(eventData) {
    try {
      const query = `
        INSERT INTO events (
          title, description, start_datetime, end_datetime, 
          location, category, event_type, is_public, creator_id, hashtags, latitude, longitude
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        ) RETURNING id;
      `;
      
      const values = [
        eventData.title,
        eventData.description,
        eventData.start_datetime,
        eventData.end_datetime,
        eventData.location,
        eventData.category,
        eventData.event_type || 'other',
        eventData.is_public,
        eventData.creator_id,
        eventData.hashtags || [],
        eventData.latitude || null,
        eventData.longitude || null
      ];
      
      const result = await pool.query(query, values);
      return result.rows[0].id;
      
    } catch (error) {
      logger.error(`Ошибка добавления события: ${error.message}`);
      throw error;
    }
  }

  async getEventsByCity(cityName) {
    try {
      const query = `
        SELECT * FROM events 
        WHERE location ILIKE $1 
        ORDER BY start_datetime ASC;
      `;
      
      const result = await pool.query(query, [`%${cityName}%`]);
      return result.rows;
      
    } catch (error) {
      logger.error(`Ошибка получения событий для города ${cityName}: ${error.message}`);
      throw error;
    }
  }

  async getEventsCount() {
    try {
      const query = 'SELECT COUNT(*) as count FROM events';
      const result = await pool.query(query);
      return parseInt(result.rows[0].count);
      
    } catch (error) {
      logger.error(`Ошибка подсчета событий: ${error.message}`);
      throw error;
    }
  }

  async checkEventExists(title, startDatetime) {
    try {
      const query = `
        SELECT id FROM events 
        WHERE title = $1 AND start_datetime = $2;
      `;
      
      const result = await pool.query(query, [title, startDatetime]);
      return result.rows.length > 0;
      
    } catch (error) {
      logger.error(`Ошибка проверки существования события: ${error.message}`);
      throw error;
    }
  }

  async close() {
    try {
      await pool.end();
      logger.info('Соединение с базой данных закрыто');
    } catch (error) {
      logger.error(`Ошибка закрытия соединения: ${error.message}`);
    }
  }
}

module.exports = new DatabaseService();
