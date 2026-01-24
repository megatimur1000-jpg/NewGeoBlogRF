import pool from './db.js';

async function checkMarkerCoordinates() {
  try {
    // Получаем все активные маркеры с координатами
    const result = await pool.query(`
      SELECT 
        id,
        title,
        creator_id,
        latitude,
        longitude,
        category,
        created_at,
        CASE 
          WHEN creator_id IS NULL THEN 'Тестовый'
          ELSE 'Реальный'
        END as marker_type
      FROM map_markers 
      WHERE is_active = true AND visibility = 'public'
      ORDER BY created_at DESC
    `);
    
    // Группируем по типу
    const testMarkers = result.rows.filter(m => m.marker_type === 'Тестовый');
    const realMarkers = result.rows.filter(m => m.marker_type === 'Реальный');
    
    :`);
    testMarkers.forEach((marker, index) => {
      `);
    });
    
    :`);
    realMarkers.forEach((marker, index) => {
      `);
    });
    
    // Проверяем, где находятся маркеры
    // Москва примерно: 55.7558, 37.6176
    const moscowLat = 55.7558;
    const moscowLng = 37.6176;
    
    result.rows.forEach((marker, index) => {
      const latDiff = Math.abs(marker.latitude - moscowLat);
      const lngDiff = Math.abs(marker.longitude - moscowLng);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      
      let location = 'Неизвестно';
      if (distance < 0.1) {
        location = 'Москва (близко)';
      } else if (distance < 1) {
        location = 'Московская область';
      } else if (distance < 5) {
        location = 'Центральная Россия';
      } else if (distance < 10) {
        location = 'Европейская часть России';
      } else {
        location = 'Далеко от Москвы';
      }
      
      }°, ${location}`);
    });
    
  } catch (error) {
    } finally {
    await pool.end();
  }
}

checkMarkerCoordinates();
