import { Pool } from 'pg';
import databaseConfig from './database.config.simple.cjs';

const pool = new Pool(databaseConfig);

async function checkColumns() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'hashtag_chat_messages' 
      ORDER BY ordinal_position
    `);
    
    result.rows.forEach(row => {
      });
    
    // Также проверим несколько записей
    const sampleResult = await pool.query('SELECT * FROM hashtag_chat_messages LIMIT 2');
    sampleResult.rows.forEach((row, index) => {
      });
    
  } catch (error) {
    } finally {
    await pool.end();
  }
}

checkColumns();
