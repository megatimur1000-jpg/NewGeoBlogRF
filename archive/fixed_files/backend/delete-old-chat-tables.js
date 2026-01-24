import { Pool } from 'pg';
import databaseConfig from './database.config.simple.cjs';

const pool = new Pool(databaseConfig);

async function deleteOldChatTables() {
  try {
    // Удаляем старые таблицы чата (они пустые и не используются)
    const tablesToDelete = [
      'chat_participants',
      'chat_messages', 
      'chat_rooms'
    ];
    
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:     for (const tableName of tablesToDelete) {
      try {
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:         const result = await pool.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
        } catch (error) {
        }
    }
    
    } catch (error) {
    } finally {
    await pool.end();
  }
}

deleteOldChatTables();




