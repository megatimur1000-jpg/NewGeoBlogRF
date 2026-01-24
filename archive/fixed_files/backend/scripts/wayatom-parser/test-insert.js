const pool = require('./config/database');

async function testInsert() {
  try {
    // Простейший тест - только обязательные поля
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:     const result = await pool.query(`
      INSERT INTO map_markers (title, latitude, longitude, category, marker_type) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id
    `, [
      'Тестовый маркер',
      56.1,
      40.1,
      'attraction',
      'standard'
    ]);
    
    } catch (error) {
    } finally {
    await pool.end();
  }
}

testInsert();

async function testInsert() {
  try {
    // Простейший тест - только обязательные поля
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:     const result = await pool.query(`
      INSERT INTO map_markers (title, latitude, longitude, category, marker_type) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id
    `, [
      'Тестовый маркер',
      56.1,
      40.1,
      'attraction',
      'standard'
    ]);
    
    } catch (error) {
    } finally {
    await pool.end();
  }
}

testInsert();


