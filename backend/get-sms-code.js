import fetch from 'node-fetch';

async function getSMSCode() {
  console.log('📱 Получаем SMS-код для тестирования...\n');

  try {
    // Отправляем повторный SMS
    const resendResponse = await fetch('http://localhost:3002/api/users/resend-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '+79991234568'
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error('❌ Ошибка повторной отправки:', error);
      return;
    }

    const resendData = await resendResponse.json();
    console.log('✅ SMS отправлен повторно:', resendData.message);

    // Теперь проверим базу данных для получения кода
    const { Pool } = await import('pg');
    const pool = new Pool({
      user: 'bestuser_temp',
      host: 'localhost',
      database: 'bestsite',
      password: '55555',
      port: 5432,
    });

    const result = await pool.query(
      `SELECT code FROM sms_codes 
       WHERE phone = $1 AND type = 'verification' 
       AND expires_at > NOW() AND used = FALSE 
       ORDER BY created_at DESC LIMIT 1`,
      ['+79991234568']
    );

    if (result.rows.length > 0) {
      console.log('🔑 SMS-код для тестирования:', result.rows[0].code);
      
      // Тестируем верификацию с правильным кодом
      console.log('\n🧪 Тестируем верификацию с правильным кодом...');
      const verifyResponse = await fetch('http://localhost:3002/api/users/verify-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: '+79991234568',
          code: result.rows[0].code
        }),
      });

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('✅ Верификация успешна:', verifyData.message);
        console.log('👤 Пользователь активирован:', verifyData.user.username);
        console.log('🔑 Токен получен:', verifyData.token ? 'Да' : 'Нет');
      } else {
        const error = await verifyResponse.json();
        console.error('❌ Ошибка верификации:', error.message);
      }
    } else {
      console.log('❌ SMS-код не найден в базе данных');
    }

    await pool.end();

  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

getSMSCode();
