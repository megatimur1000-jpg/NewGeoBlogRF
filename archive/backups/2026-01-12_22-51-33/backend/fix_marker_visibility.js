import pool from './db.js';

async function fixMarkerVisibility() {
  try {
    // Проверяем текущее состояние
    const beforeResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN creator_id IS NULL THEN 1 END) as null_creator,
        COUNT(CASE WHEN creator_id IS NOT NULL THEN 1 END) as not_null_creator,
        COUNT(CASE WHEN visibility = 'public' THEN 1 END) as public_count,
        COUNT(CASE WHEN visibility = 'private' THEN 1 END) as private_count,
        COUNT(CASE WHEN visibility = 'friends' THEN 1 END) as friends_count
      FROM map_markers 
      WHERE is_active = true
    `);
    
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:     const before = beforeResult.rows[0];
    // Обновляем все маркеры с реальными creator_id на public
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:     const updateResult = await pool.query(`
      UPDATE map_markers 
      SET visibility = 'public' 
      WHERE creator_id IS NOT NULL AND is_active = true
    `);
    
    // Проверяем состояние после обновления
    const afterResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN creator_id IS NULL THEN 1 END) as null_creator,
        COUNT(CASE WHEN creator_id IS NOT NULL THEN 1 END) as not_null_creator,
        COUNT(CASE WHEN visibility = 'public' THEN 1 END) as public_count,
        COUNT(CASE WHEN visibility = 'private' THEN 1 END) as private_count,
        COUNT(CASE WHEN visibility = 'friends' THEN 1 END) as friends_count
      FROM map_markers 
      WHERE is_active = true
    `);
    
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:     const after = afterResult.rows[0];
    // Показываем обновленные маркеры
    const updatedMarkersResult = await pool.query(`
      SELECT id, title, creator_id, visibility, created_at
      FROM map_markers 
      WHERE creator_id IS NOT NULL AND is_active = true
      ORDER BY created_at DESC
    `);
    
    updatedMarkersResult.rows.forEach((marker, index) => {
      });
    
  } catch (error) {
    } finally {
    await pool.end();
  }
}

fixMarkerVisibility();

