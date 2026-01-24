import pool from './db.js';
import { createEvent } from './src/controllers/eventController.js';

async function testCreateEventDirect() {
  console.log('=== Прямое тестирование создания события ===');
  
  try {
    // Создаем событие напрямую через контроллер
    const mockReq = {
      user: { id: 1 }, // используем фиксированный ID пользователя
      body: {
        title: 'Тестовое событие для геймификации',
        description: 'Описание тестового события',
        start_datetime: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        end_datetime: new Date(Date.now() + 7*24*60*60*1000 + 60*60*1000).toISOString(),
        location: 'Тестовое место',
        category: 'cultural',
        photo_urls: ['https://example.com/test.jpg'],
        hashtags: ['тест'],
        organizer: 'Тестовый организатор',
        latitude: 55.7558,
        longitude: 37.6176,
        is_public: true
      }
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          if (code === 201) {
            console.log('✓ Событие создано:', data.id);
            return testEventCompleteness(data.id);
          } else {
            console.error('Ошибка:', data);
          }
        }
      })
    };
    
    await createEvent(mockReq, mockRes);
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

async function testEventCompleteness(eventId) {
  try {
    console.log(`\n=== Тестирование полноты события ${eventId} ===`);
    
    // Проверяем полноту
    const completenessResponse = await fetch(`http://localhost:3002/api/events/${eventId}/completeness`, {
      method: 'GET'
    });
    
    if (!completenessResponse.ok) {
      throw new Error(`Ошибка получения полноты: ${completenessResponse.status}`);
    }
    
    const completenessResult = await completenessResponse.json();
    console.log(`✓ Полнота: ${completenessResult.data.completeness.score}% (${completenessResult.data.completeness.status})`);
    
    // Начисляем очки (нужен токен, но пока попробуем без него)
    console.log('\n=== Начисление очков ===');
    
    const pointsResponse = await fetch(`http://localhost:3002/api/events/${eventId}/award-points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (pointsResponse.ok) {
      const pointsResult = await pointsResponse.json();
      console.log(`✓ Очки начислены: ${pointsResult.data.points.totalPoints} очков`);
    } else {
      const errorData = await pointsResponse.json();
      console.log(`Ошибка начисления очков: ${errorData.message}`);
    }
    
  } catch (error) {
    console.error('Ошибка тестирования полноты:', error.message);
  }
}

// Проверяем подключение к БД
import('./db.js').then(db => {
  return db.default.query('SELECT id FROM users LIMIT 1');
}).then(result => {
  if (result.rows.length > 0) {
    testCreateEventDirect();
  } else {
    console.log('Нет пользователей в базе данных');
  }
}).catch(error => {
  console.error('Ошибка подключения к БД:', error.message);
});
