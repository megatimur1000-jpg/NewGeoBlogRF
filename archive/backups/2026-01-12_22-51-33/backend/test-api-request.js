import fetch from 'node-fetch';

async function testAPIRequest() {
  try {
    console.log('🔍 Тестируем API запрос создания маршрута...\n');

    // Генерируем токен
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:     const testUserId = 'c0421a84-8760-42bb-8b7c-72f4ed1e2e1b';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMwNDIxYTg0LTg3NjAtNDJiYi04YjdjLTcyZjRlZDFlMmUxYiIsInVzZXJJZCI6ImMwNDIxYTg0LTg3NjAtNDJiYi04YjdjLTcyZjRlZDFlMmUxYiIsInJvbGUiOiJyZWdpc3RlcmVkIiwiaWF0IjoxNzYwMTE3MzkzLCJleHAiOjE3NjA3MjIxOTN9.khpRTaDr7C6QC2Sf2tjtSe0DKFRhmy2OjsTjUiYwW3E';

    const routeData = {
      title: 'Тестовый маршрут через API',
      description: 'Маршрут создан через HTTP запрос',
      start_date: '2025-10-12',
      end_date: '2025-10-13',
      transport_type: ['car'],
      route_data: {
        points: [
          {
            id: '0ace6a56-1dd3-45ad-b400-fed4399fdc8c',
            latitude: 53.36062250,
            longitude: 83.73084770,
            title: 'Шоколад',
            description: 'Тестовая точка'
          },
          {
            id: 'ed727ea2-147b-46eb-82db-02cd58d6c19f',
            latitude: 53.36349610,
            longitude: 83.73607930,
            title: 'Чайка',
            description: 'Тестовая точка'
          }
        ],
        metadata: {
          totalDistance: 0,
          estimatedDuration: 0,
          estimatedCost: 0,
          difficultyLevel: 1,
          transportType: ['car'],
          tags: ['тест']
        }
      },
      total_distance: 0,
      estimated_duration: 0,
      estimated_cost: 0,
      difficulty_level: 1,
      is_public: false,
      tags: ['тест'],
      waypoints: [
        {
          marker_id: '0ace6a56-1dd3-45ad-b400-fed4399fdc8c',
          order_index: 0,
          arrival_time: undefined,
          departure_time: undefined,
          duration_minutes: undefined,
          notes: '',
          is_overnight: false
        },
        {
          marker_id: 'ed727ea2-147b-46eb-82db-02cd58d6c19f',
          order_index: 1,
          arrival_time: undefined,
          departure_time: undefined,
          duration_minutes: undefined,
          notes: '',
          is_overnight: false
        }
      ]
    };

    console.log('📤 Отправляем POST запрос на /api/routes...');
    console.log('Данные:', JSON.stringify(routeData, null, 2));

    const response = await fetch('http://localhost:3002/api/routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(routeData)
    });

    console.log(`\n📥 Ответ сервера:`);
    console.log(`Статус: ${response.status} ${response.statusText}`);

    const responseText = await response.text();
    console.log(`Тело ответа: ${responseText}`);

    if (response.ok) {
      console.log('✅ Маршрут создан успешно через API!');
    } else {
      console.log('❌ Ошибка создания маршрута через API');
    }

  } catch (error) {
    console.error('❌ Ошибка запроса:', error);
    console.error('Stack:', error.stack);
  } finally {
    process.exit();
  }
}

testAPIRequest();

