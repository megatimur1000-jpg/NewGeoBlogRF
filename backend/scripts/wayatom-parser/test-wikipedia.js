const pool = require('./config/database');

async function testWikipedia() {
  try {
    // Получаем один маркер для теста
    const marker = await pool.query(`
      SELECT id, title, description, metadata 
      FROM map_markers 
      WHERE metadata->>'has_wikipedia' IS NULL
      LIMIT 1
    `);
    
    if (marker.rows.length === 0) {
      return;
    }
    
    const testMarker = marker.rows[0];
    // Тестируем обновление metadata
    try {
      await pool.query(`
        UPDATE map_markers 
        SET 
          description = $1,
          metadata = jsonb_set(
            jsonb_set(COALESCE(metadata, '{}'), '{has_wikipedia}', '"true"'),
            '{wikipedia_description}', $2
          )
        WHERE id = $3
      `, [
        'Тестовое описание с Wikipedia',
        '"Тестовое описание с Wikipedia"',
        testMarker.id
      ]);
      
      // Проверяем результат
      const updatedMarker = await pool.query(`
        SELECT title, description, metadata 
        FROM map_markers 
        WHERE id = $1
      `, [testMarker.id]);
      
      }`);
      
    } catch (error) {
      }
    
  } catch (error) {
    } finally {
    await pool.end();
  }
}

testWikipedia();