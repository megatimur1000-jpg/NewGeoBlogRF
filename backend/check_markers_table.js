import pool from './db.js';

async function checkMarkersTable() {
  try {
    // Получаем структуру таблицы
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'map_markers' 
      ORDER BY ordinal_position
    `);
    
    structureResult.rows.forEach(row => {
      `);
    });
    
    // Получаем все маркеры
    const markersResult = await pool.query('SELECT * FROM map_markers');
    // Анализируем creator_id
    const nullCreatorCount = markersResult.rows.filter(m => m.creator_id === null).length;
    const notNullCreatorCount = markersResult.rows.filter(m => m.creator_id !== null).length;
    
    // Показываем примеры маркеров
    markersResult.rows.slice(0, 5).forEach((marker, index) => {
      });
    
    // Проверяем активные маркеры
    const activeMarkersResult = await pool.query('SELECT * FROM map_markers WHERE is_active = true');
    // Анализируем creator_id для активных маркеров
    const activeNullCreatorCount = activeMarkersResult.rows.filter(m => m.creator_id === null).length;
    const activeNotNullCreatorCount = activeMarkersResult.rows.filter(m => m.creator_id !== null).length;
    
    } catch (error) {
    } finally {
    await pool.end();
  }
}

checkMarkersTable();
