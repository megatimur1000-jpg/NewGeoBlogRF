import pool from './db.js';

async function checkUser() {
  try {
    console.log('🔍 Проверяем тестового пользователя...');
    
    const result = await pool.query('SELECT id, email, username FROM users WHERE email = $1', ['test@example.com']);
    
    if (result.rows.length === 0) {
      console.log('❌ Пользователь test@example.com не найден');
      console.log('🔍 Создаем тестового пользователя...');
      
      // Создаем тестового пользователя
      const createResult = await pool.query(`
        INSERT INTO users (email, username, password_hash, phone, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, email, username
      `, ['test@example.com', 'testuser', 'test123', '+7-999-123-45-67']);
      
      console.log('✅ Тестовый пользователь создан:', createResult.rows[0]);
    } else {
      console.log('✅ Пользователь найден:', result.rows[0]);
    }
    
    // Проверяем всех пользователей
    const allUsers = await pool.query('SELECT id, email, username, phone FROM users ORDER BY created_at DESC LIMIT 5');
    console.log('📋 Последние 5 пользователей:');
    allUsers.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.username}) - ${user.phone || 'без телефона'}`);
    });
    
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
  } finally {
    await pool.end();
  }
}

checkUser();
