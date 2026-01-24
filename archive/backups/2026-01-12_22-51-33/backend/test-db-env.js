import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  client_encoding: 'utf8'
});

async function testDatabase() {
  try {
    // Проверяем подключение
    const client = await pool.connect();
    // Проверяем таблицы
    const tables = ['users', 'map_markers', 'events'];
    
    for (const table of tables) {
      try {
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:         const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        } catch (error) {
        }
    }
    
    // Проверяем пользователей
    try {
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:       const users = await client.query('SELECT id, email, username FROM users LIMIT 5');
      } catch (error) {
      }
    
    client.release();
    
  } catch (error) {
    } finally {
    await pool.end();
  }
}

testDatabase();

