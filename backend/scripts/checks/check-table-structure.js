import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'bestsite',
  user: 'bestuser_temp',
  password: '55555',
});

async function checkStructure() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'map_markers' 
      ORDER BY ordinal_position
    `);
    
    result.rows.forEach(row => {
      `);
    });
    
  } catch (error) {
    } finally {
    await pool.end();
  }
}

checkStructure();
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'bestsite',
  user: 'bestuser_temp',
  password: '55555',
});

async function checkStructure() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'map_markers' 
      ORDER BY ordinal_position
    `);
    
    result.rows.forEach(row => {
      `);
    });
    
  } catch (error) {
    } finally {
    await pool.end();
  }
}

checkStructure();