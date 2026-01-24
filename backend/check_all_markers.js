import pool from './db.js';

async function checkAllMarkers() {
  try {
    // Получаем все маркеры с группировкой по visibility
    const result = await pool.query(`
      SELECT 
        visibility,
        COUNT(*) as count,
        COUNT(CASE WHEN creator_id IS NULL THEN 1 END) as null_creator_count,
        COUNT(CASE WHEN creator_id IS NOT NULL THEN 1 END) as not_null_creator_count
      FROM map_markers 
      WHERE is_active = true
      GROUP BY visibility
      ORDER BY visibility
    `);
    
    result.rows.forEach(row => {
      `);
    });
    
    // Показываем детали по каждому маркеру
    const allMarkersResult = await pool.query(`
      SELECT id, title, creator_id, is_active, visibility, created_at
      FROM map_markers 
      WHERE is_active = true
      ORDER BY created_at DESC
    `);
    
    allMarkersResult.rows.forEach((marker, index) => {
      const creatorInfo = marker.creator_id ? `UUID: ${marker.creator_id}` : 'NULL';
      });
    
  } catch (error) {
    } finally {
    await pool.end();
  }
}

checkAllMarkers();
