import { Pool } from 'pg';
import databaseConfig from './database.config.simple.cjs';

const pool = new Pool(databaseConfig);

async function checkEnums() {
  try {
    const client = await pool.connect();
    
    // Проверяем все enum типы
    try {
      const result = await client.query(`
        SELECT typname 
        FROM pg_type 
        WHERE typtype = 'e'
        ORDER BY typname
      `);
      result.rows.forEach(row => );
    } catch (error) {
      }
    
    // Проверяем enum для chat_type
    try {
      const result = await client.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (
          SELECT oid FROM pg_type WHERE typname = 'chat_type'
        )
        ORDER BY enumsortorder
      `);
      result.rows.forEach(row => );
    } catch (error) {
      }
    
    // Проверяем enum для chat_room_type
    try {
      const result = await client.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (
          SELECT oid FROM pg_type WHERE typname = 'chat_room_type'
        )
        ORDER BY enumsortorder
      `);
      if (result.rows.length === 0) {
        ');
      } else {
        result.rows.forEach(row => );
      }
    } catch (error) {
      }
    
    // Проверяем enum для participant_role
    try {
      const result = await client.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (
          SELECT oid FROM pg_type WHERE typname = 'participant_role'
        )
        ORDER BY enumsortorder
      `);
      result.rows.forEach(row => );
    } catch (error) {
      }
    
    client.release();
    
  } catch (error) {
    } finally {
    await pool.end();
  }
}

checkEnums();
