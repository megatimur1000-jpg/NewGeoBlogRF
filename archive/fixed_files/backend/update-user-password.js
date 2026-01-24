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

async function updateUserPassword() {
  try {
    const client = await pool.connect();
    // Обновляем пароль для пользователя Testuser@example.com
    const email = 'Testuser@example.com';
    const newPassword = 'test123';
    
    // Хешируем новый пароль
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Обновляем пароль
    const result = await client.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2 RETURNING id, email, username',
      [hashedPassword, email]
    );

    if (result.rows.length === 0) {
      } else {
// SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original:       const user = result.rows[0];
      }

    client.release();

  } catch (error) {
    } finally {
    await pool.end();
  }
}

updateUserPassword(); 


