import { Pool } from 'pg';
import databaseConfig from './database.config.simple.cjs';

const pool = new Pool(databaseConfig);

async function testDatabase() {
  try {
    // Проверяем подключение
    const client = await pool.connect();
    // Проверяем таблицы чата
    const tables = ['chat_rooms', 'chat_participants', 'chat_messages', 'message_reactions'];
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        } catch (error) {
        }
    }
    
    // Проверяем пользователей
    try {
      const users = await client.query('SELECT id, name FROM users LIMIT 5');
      } catch (error) {
      }
    
    client.release();
    
  } catch (error) {
    } finally {
    await pool.end();
  }
}

testDatabase();

