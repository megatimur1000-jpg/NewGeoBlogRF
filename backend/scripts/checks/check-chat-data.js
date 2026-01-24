import { Pool } from 'pg';
import databaseConfig from './database.config.simple.cjs';

const pool = new Pool(databaseConfig);

async function checkChatData() {
  try {
    // Проверяем комнаты
    const roomsResult = await pool.query('SELECT * FROM hashtag_chat_rooms');
    roomsResult.rows.forEach(room => {
      });
    
    const messagesResult = await pool.query('SELECT * FROM hashtag_chat_messages LIMIT 10');
    messagesResult.rows.forEach(msg => {
      }...`);
    });
    
    const usersResult = await pool.query('SELECT * FROM users LIMIT 5');
    usersResult.rows.forEach(user => {
      });
    
  } catch (error) {
    } finally {
    await pool.end();
  }
}

checkChatData();
