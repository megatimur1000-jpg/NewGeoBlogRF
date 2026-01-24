import pool from './db.js';

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, username, email FROM users LIMIT 5');
    console.log('👥 Пользователи в БД:');
    if (result.rows.length === 0) {
      console.log('   Нет пользователей');
    } else {
      result.rows.forEach(user => {
        console.log(`   - ${user.username} (${user.email})`);
      });
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsers();