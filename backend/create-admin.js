import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Используем те же настройки, что и в db.js
const pool = new Pool({
  user: process.env.DB_USER || 'bestuser_temp',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'bestsite',
  password: process.env.DB_PASSWORD || '55555',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  client_encoding: 'utf8'
});

async function createAdmin() {
  const client = await pool.connect();
  
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@geoblog.ru';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    
    console.log('🔐 Создание администратора...');
    console.log(`Email: ${adminEmail}`);
    console.log(`Username: ${adminUsername}`);
    
    // Проверяем, существует ли уже админ
    const checkResult = await client.query(
      'SELECT id, email, username, role FROM users WHERE email = $1 OR username = $2',
      [adminEmail, adminUsername]
    );
    
    if (checkResult.rows.length > 0) {
      const existing = checkResult.rows[0];
      console.log('⚠️  Пользователь уже существует:');
      console.log(`   ID: ${existing.id}`);
      console.log(`   Email: ${existing.email}`);
      console.log(`   Username: ${existing.username}`);
      console.log(`   Role: ${existing.role}`);
      
      // Обновляем роль на admin, если нужно
      if (existing.role !== 'admin') {
        await client.query(
          'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2',
          ['admin', existing.id]
        );
        console.log('✅ Роль обновлена на "admin"');
      } else {
        console.log('✅ Пользователь уже является администратором');
      }
      
      // Обновляем пароль, если нужно
      if (process.env.ADMIN_PASSWORD) {
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        await client.query(
          'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
          [passwordHash, existing.id]
        );
        console.log('✅ Пароль обновлен');
      }
      
      return existing;
    }
    
    // Хешируем пароль
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    // Создаем админа
    const result = await client.query(
      `INSERT INTO users (email, username, password_hash, role, is_verified, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, email, username, role, created_at`,
      [adminEmail, adminUsername, passwordHash, 'admin', true, true]
    );
    
    const admin = result.rows[0];
    
    console.log('✅ Администратор успешно создан!');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Created: ${admin.created_at}`);
    console.log('');
    console.log('🔑 Данные для входа:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('');
    console.log('⚠️  ВАЖНО: Сохраните эти данные в безопасном месте!');
    
    return admin;
  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createAdmin()
  .then(() => {
    console.log('✅ Готово!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  });

