const pool = require('./config/database');

async function analyzeMarkers() {
  try {
    // Общая статистика
    const totalResult = await pool.query('SELECT COUNT(*) FROM map_markers');
    const totalMarkers = parseInt(totalResult.rows[0].count);
    // Маркеры по категориям
    const categoriesResult = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM map_markers 
      GROUP BY category 
      ORDER BY count DESC
    `);
    categoriesResult.rows.forEach(row => {
      });
    
    // Маркеры по авторам
    const authorsResult = await pool.query(`
      SELECT author_name, COUNT(*) as count 
      FROM map_markers 
      GROUP BY author_name 
      ORDER BY count DESC
    `);
    authorsResult.rows.forEach(row => {
      });
    
    // Отредактированные маркеры
    const editedResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM map_markers 
      WHERE metadata->>'is_edited' = 'true'
    `);
    const editedCount = parseInt(editedResult.rows[0].count);
    // Маркеры с Wikipedia
    const wikipediaResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM map_markers 
      WHERE metadata->>'has_wikipedia' = 'true'
    `);
    const wikipediaCount = parseInt(wikipediaResult.rows[0].count);
    // Примеры маркеров для модерации
    const moderationResult = await pool.query(`
      SELECT id, title, description, category, metadata
      FROM map_markers 
      WHERE metadata->>'is_edited' = 'false'
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    moderationResult.rows.forEach((marker, i) => {
      `);
      });
    
    // Рекомендации по улучшению
    } catch (error) {
    } finally {
    await pool.end();
  }
}

analyzeMarkers();
async function analyzeMarkers() {
  try {
    // Общая статистика
    const totalResult = await pool.query('SELECT COUNT(*) FROM map_markers');
    const totalMarkers = parseInt(totalResult.rows[0].count);
    // Маркеры по категориям
    const categoriesResult = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM map_markers 
      GROUP BY category 
      ORDER BY count DESC
    `);
    categoriesResult.rows.forEach(row => {
      });
    
    // Маркеры по авторам
    const authorsResult = await pool.query(`
      SELECT author_name, COUNT(*) as count 
      FROM map_markers 
      GROUP BY author_name 
      ORDER BY count DESC
    `);
    authorsResult.rows.forEach(row => {
      });
    
    // Отредактированные маркеры
    const editedResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM map_markers 
      WHERE metadata->>'is_edited' = 'true'
    `);
    const editedCount = parseInt(editedResult.rows[0].count);
    // Маркеры с Wikipedia
    const wikipediaResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM map_markers 
      WHERE metadata->>'has_wikipedia' = 'true'
    `);
    const wikipediaCount = parseInt(wikipediaResult.rows[0].count);
    // Примеры маркеров для модерации
    const moderationResult = await pool.query(`
      SELECT id, title, description, category, metadata
      FROM map_markers 
      WHERE metadata->>'is_edited' = 'false'
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    moderationResult.rows.forEach((marker, i) => {
      `);
      });
    
    // Рекомендации по улучшению
    } catch (error) {
    } finally {
    await pool.end();
  }
}

analyzeMarkers();