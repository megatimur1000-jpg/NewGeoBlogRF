import pool from './src/database/config.js';

async function checkActivityFeedStructure() {
  try {
    // Проверяем структуру таблицы
    const structureResult = await pool.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'activity_feed'
      ORDER BY ordinal_position
    `);
    
    structureResult.rows.forEach(row => {
      `);
    });
    
    // Проверяем ENUM типы
    const enumResult = await pool.query(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname LIKE '%activity%'
      ORDER BY t.typname, e.enumsortorder
    `);
    
    enumResult.rows.forEach(row => {
      });
    
  } catch (error) {
    } finally {
    process.exit(0);
  }
}

checkActivityFeedStructure();

