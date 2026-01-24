const pool = require('./config/database');

async function checkCategories() {
  try {
    // Проверяем тип данных для category
    const result = await pool.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'map_markers' AND column_name = 'category'
    `);
    
    // Проверяем enum значения
    const enumResult = await pool.query(`
      SELECT unnest(enum_range(NULL::marker_category)) as category
    `);
    
    enumResult.rows.forEach(row => );
    
    await pool.end();
  } catch (error) {
    await pool.end();
  }
}

checkCategories();

async function checkCategories() {
  try {
    // Проверяем тип данных для category
    const result = await pool.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'map_markers' AND column_name = 'category'
    `);
    
    // Проверяем enum значения
    const enumResult = await pool.query(`
      SELECT unnest(enum_range(NULL::marker_category)) as category
    `);
    
    enumResult.rows.forEach(row => );
    
    await pool.end();
  } catch (error) {
    await pool.end();
  }
}

checkCategories();

