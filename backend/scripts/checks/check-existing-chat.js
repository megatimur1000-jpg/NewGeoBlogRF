import { Pool } from 'pg';
import databaseConfig from './database.config.simple.cjs';

const pool = new Pool(databaseConfig);

async function checkExistingChat() {
  try {
    const client = await pool.connect();
    
    // Проверяем существующие таблицы
    const tables = ['chat_rooms', 'chat_participants', 'chat_messages'];
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        } catch (error) {
        }
    }
    
    // Проверяем данные в chat_rooms
    try {
      const rooms = await client.query('SELECT * FROM chat_rooms LIMIT 5');
      rooms.rows.forEach(room => {
        });
    } catch (error) {
      }
    
    // Проверяем данные в chat_messages
    try {
      const messages = await client.query('SELECT * FROM chat_messages LIMIT 5');
      messages.rows.forEach(msg => {
        }...`);
      });
    } catch (error) {
      }
    
    client.release();
    
  } catch (error) {
    } finally {
    await pool.end();
  }
}

checkExistingChat();

