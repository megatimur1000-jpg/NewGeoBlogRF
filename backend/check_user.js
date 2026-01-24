import pool from './src/database/config.js';
import bcrypt from 'bcryptjs';

async function checkUser() {
  try {
    console.log('🔍 Проверяем тестового пользователя...');
    
    const result = await pool.query('SELECT id, email, username FROM users WHERE email = $1', ['test@example.com']);
    
    if (result.rows.length > 0) {
      console.log('✅ Тестовый пользователь найден:', result.rows[0]);
    } else {
      console.log('❌ Тестовый пользователь НЕ найден');
      console.log('Создаём тестового пользователя...');
      
      const hashedPassword = await bcrypt.hash('test123', 10);
      
      const insertResult = await pool.query(
        'INSERT INTO users (email, username, password_hash, role, is_verified, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id, email, username',
        ['test@example.com', 'testuser', hashedPassword, 'registered', true, true]
      );
      
      console.log('✅ Тестовый пользователь создан:', insertResult.rows[0]);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await pool.end();
  }
}

checkUser();
