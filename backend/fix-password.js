import pool from './db.js';
import { hashPassword } from './src/utils/password.js';

async function fixPassword() {
  try {
    console.log('🔍 Исправляем пароль тестового пользователя...');
    
    // Хешируем пароль
    const hashedPassword = await hashPassword('test123');
    console.log('🔐 Хешированный пароль:', hashedPassword);
    
    // Обновляем пароль в базе данных
    const result = await pool.query(`
      UPDATE users 
      SET password_hash = $1, updated_at = NOW()
      WHERE email = $2
      RETURNING id, email, username, phone
    `, [hashedPassword, 'test@example.com']);
    
    if (result.rows.length === 0) {
      console.log('❌ Пользователь test@example.com не найден');
      return;
    }
    
    console.log('✅ Пароль обновлен для пользователя:', result.rows[0]);
    
    // Проверяем авторизацию
    console.log('🔍 Проверяем авторизацию...');
    const { comparePassword } = await import('./src/utils/password.js');
    
    const authResult = await pool.query(`
      SELECT id, email, username, phone, password_hash
      FROM users 
      WHERE email = $1
    `, ['test@example.com']);
    
    if (authResult.rows.length > 0) {
      const user = authResult.rows[0];
      const isValidPassword = await comparePassword('test123', user.password_hash);
      
      if (isValidPassword) {
        console.log('✅ Авторизация работает!');
        console.log('📋 Данные для входа:');
        console.log('  Email: test@example.com');
        console.log('  Пароль: test123');
        console.log('  Телефон:', user.phone);
      } else {
        console.log('❌ Авторизация не работает');
      }
    }
    
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
  } finally {
    await pool.end();
  }
}

fixPassword();
