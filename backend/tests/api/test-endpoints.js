import fetch from 'node-fetch';

async function testEndpoints() {
  console.log('=== Тестирование эндпоинтов геймификации событий ===');

  try {
    // 1. Получаем список событий, чтобы взять первое
    console.log('1. Получение списка событий...');
    const eventsResponse = await fetch('http://localhost:3002/api/events');
    
    if (!eventsResponse.ok) {
      console.error('❌ Ошибка получения событий:', eventsResponse.status);
      return;
    }
    
    const events = await eventsResponse.json();
    if (!events || events.length === 0) {
      console.error('❌ Нет событий для тестирования');
      return;
    }
    
    const eventId = events[0].id;
    console.log('✅ События получены. Тестируем с ID:', eventId);

    // 2. Тестируем эндпоинт полноты
    console.log('\n2. Тестирование эндпоинта полноты...');
    const completenessResponse = await fetch(`http://localhost:3002/api/events/${eventId}/completeness`);
    
    if (!completenessResponse.ok) {
      console.error('❌ Эндпоинт полноты не работает:', completenessResponse.status);
      const errorText = await completenessResponse.text();
      console.error('Ошибка:', errorText);
      return;
    }
    
    const completenessData = await completenessResponse.json();
    console.log('✅ Эндпоинт полноты работает!');
    console.log('Данные:', JSON.stringify(completenessData, null, 2));

    // 3. Тестируем эндпоинт начисления очков (без токена для простоты)
    console.log('\n3. Тестирование эндпоинта начисления очков...');
    const pointsResponse = await fetch(`http://localhost:3002/api/events/${eventId}/award-points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    console.log('Статус ответа:', pointsResponse.status);
    
    if (pointsResponse.status === 401) {
      console.log('✅ Эндпоинт начисления очков требует авторизацию (ожидаемо)');
    } else if (pointsResponse.ok) {
      const pointsData = pointsResponse.json();
      console.log('✅ Эндпоинт начисления очков работает!');
      console.log('Данные:', JSON.stringify(pointsData, null, 2));
    } else {
      console.log('❌ Проблема с эндпоинтом начисления очков:', pointsResponse.status);
      const errorText = await pointsResponse.text();
      console.log('Ошибка:', errorText);
    }

    console.log('\n=== Тестирование завершено ===');

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
  }
}

testEndpoints();
