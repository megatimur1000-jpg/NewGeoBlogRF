import pool from './db.js';

async function fixMarkerCoordinates() {
  try {
    // Получаем маркеры с неправильными координатами (где creator_id != null)
    const result = await pool.query(`
      SELECT id, title, latitude, longitude, creator_id
      FROM map_markers 
      WHERE creator_id IS NOT NULL AND is_active = true
      ORDER BY created_at DESC
    `);
    
    // Исправляем координаты (меняем местами latitude и longitude)
    for (const marker of result.rows) {
      const oldLat = marker.latitude;
      const oldLng = marker.longitude;
      const newLat = oldLng; // Бывший longitude становится latitude
      const newLng = oldLat; // Бывший latitude становится longitude
      
      await pool.query(
        'UPDATE map_markers SET latitude = $1, longitude = $2 WHERE id = $3',
        [newLat, newLng, marker.id]
      );
    }
    
    // Проверяем результат
    const checkResult = await pool.query(`
      SELECT id, title, latitude, longitude, creator_id
      FROM map_markers 
      WHERE creator_id IS NOT NULL AND is_active = true
      ORDER BY created_at DESC
    `);
    
    checkResult.rows.forEach((marker, index) => {
      });
    
  } catch (error) {
    } finally {
    await pool.end();
  }
}

fixMarkerCoordinates();
