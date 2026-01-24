import { Pool } from 'pg';
import databaseConfig from './database.config.simple.cjs';
import fs from 'fs';
import path from 'path';

const pool = new Pool(databaseConfig);

async function setupReactionsTable() {
  try {
    // Читаем SQL файл
    const sqlPath = path.join(process.cwd(), 'create-reactions-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Выполняем SQL
    await pool.query(sqlContent);
    
    } catch (error) {
    } finally {
    await pool.end();
  }
}

setupReactionsTable();
