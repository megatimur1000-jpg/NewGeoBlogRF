const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class DatabaseService {
  async insertMarker(markerData) {
    const client = await pool.connect();
    
    try {
      const query = `
        INSERT INTO map_markers (
          title, description, latitude, longitude, category
        ) VALUES (
          $1, $2, $3, $4, $5
        ) RETURNING id;
      `;

      const values = [
        markerData.title,
        markerData.description,
        markerData.latitude,
        markerData.longitude,
        markerData.category
      ];

      const result = await client.query(query, values);
      logger.info(`Добавлен маркер: ${markerData.title}`);
      
      return result.rows[0].id;
    } catch (error) {
      if (error.code === '23505') { // Duplicate key
        logger.warn(`Маркер уже существует: ${markerData.title}`);
        return null;
      }
      
      logger.error(`Ошибка добавления маркера: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  async checkMarkerExists(title, latitude, longitude) {
    try {
      const query = `
        SELECT id FROM map_markers 
        WHERE title = $1 
        AND ABS(latitude - $2) < 0.001 
        AND ABS(longitude - $3) < 0.001
        LIMIT 1;
      `;
      
      const result = await pool.query(query, [title, latitude, longitude]);
      return result.rows.length > 0;
    } catch (error) {
      logger.error(`Ошибка проверки существования маркера: ${error.message}`);
      return false;
    }
  }

  async getMarkersCount() {
    try {
      const result = await pool.query('SELECT COUNT(*) as count FROM map_markers');
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error(`Ошибка получения количества маркеров: ${error.message}`);
      return 0;
    }
  }
}

module.exports = new DatabaseService();