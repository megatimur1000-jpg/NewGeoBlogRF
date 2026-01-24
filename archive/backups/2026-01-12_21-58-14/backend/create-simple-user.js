import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER || 'bestuser_temp',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'bestsite',
  password: process.env.DB_PASSWORD || '55555',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  client_encoding: 'utf8'
});

async function createSimpleUser() {
  try {
    const client = await pool.connect();
    // Создаем простого пользователя с известными данными
    const email = 'admin@test.com';
    const username = 'admin';
    const password = 'admin123';
    
    // Проверяем, существует ли уже пользователь
    const existingUser = await client.query(
      'SELECT id, email, username FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      // Обновляем пароль
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
        [hashedPassword, email]
      );
      
      client.release();
      return;
    }
    
    // Хешируем пароль
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Создаем нового пользователя
    const result = await client.query(
      `INSERT INTO users (email, username, password_hash, role, created_at, updated_at) 
       VALUES ($1, $2, $3, 'registered', NOW(), NOW()) 
       RETURNING id, email, username, role, created_at`,
      [email, username, hashedPassword]
    );

    const user = result.rows[0];
    client.release();

  } catch (error) {
    } finally {
    await pool.end();
  }
}

createSimpleUser(); 