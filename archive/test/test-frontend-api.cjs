const http = require('http');

console.log('🔍 Тестируем фронтенд логин...');

const postData = JSON.stringify({
  email: 'test@example.com',
  password: 'test123'
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/users/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': 'http://localhost:5173',
    'Referer': 'http://localhost:5173/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

console.log('📡 Отправляем запрос с заголовками как браузер...');
const req = http.request(options, (res) => {
  console.log('📡 Статус:', res.statusCode);
  console.log('📡 Заголовки ответа:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📡 Ответ:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('✅ Парсинг успешен:');
      console.log('  - message:', parsed.message);
      console.log('  - user:', parsed.user);
      console.log('  - token:', parsed.token ? 'ЕСТЬ' : 'НЕТ');
    } catch (e) {
      console.log('❌ Ошибка парсинга:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Ошибка запроса:', e.message);
});

req.write(postData);
req.end();
