import { Pool } from 'pg';
import databaseConfig from './database.config.simple.cjs';

const pool = new Pool(databaseConfig);

async function checkHashtagTables() {
  try {
    const client = await pool.connect();
    
    // Проверяем комнаты
    const rooms = await client.query('SELECT * FROM hashtag_chat_rooms ORDER BY created_at');
    rooms.rows.forEach(room => {
      `);
    });
    
    // Проверяем сообщения
    const messages = await client.query(`
      SELECT m.*, r.title as room_title 
      FROM hashtag_chat_messages m 
      LEFT JOIN hashtag_chat_rooms r ON m.hashtag = r.hashtag 
      ORDER BY m.created_at DESC 
      LIMIT 10
    `);
    messages.rows.forEach(msg => {
      });
    
    // Статистика
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_rooms,
        SUM(online_users) as total_online,
        (SELECT COUNT(*) FROM hashtag_chat_messages) as total_messages
      FROM hashtag_chat_rooms
    `);
    client.release();
    
  } catch (error) {
    } finally {
    await pool.end();
  }
}

checkHashtagTables();

