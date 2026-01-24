import pool from './db.js';
import { generateToken } from './src/utils/jwt.js';

async function testRouteWithRealMarkers() {
  try {
    console.log('🔍 Тестируем создание маршрута с реальными маркерами...\n');

    // Генерируем тестовый токен
    const testUserId = 'c0421a84-8760-42bb-8b7c-72f4ed1e2e1b';
    const token = generateToken(testUserId, 'registered');
    console.log('✅ Токен сгенерирован');

    // Получаем реальные маркеры из БД
    console.log('\n🔍 Получаем реальные маркеры...');
    const markersResult = await pool.query('SELECT id FROM map_markers LIMIT 2');
    
    if (markersResult.rows.length < 2) {
      console.log('❌ Недостаточно маркеров в БД. Создаем тестовые...');
      
      // Создаем тестовые маркеры
      const marker1 = await pool.query(`
        INSERT INTO map_markers (id, title, latitude, longitude, category, created_at)
        VALUES (gen_random_uuid(), 'Тестовая метка 1', 55.7558, 37.6176, 'attraction', NOW())
        RETURNING id
      `);
      
      const marker2 = await pool.query(`
        INSERT INTO map_markers (id, title, latitude, longitude, category, created_at)
        VALUES (gen_random_uuid(), 'Тестовая метка 2', 55.7600, 37.6200, 'attraction', NOW())
        RETURNING id
      `);
      
      console.log('✅ Тестовые маркеры созданы');
      markersResult.rows = [marker1.rows[0], marker2.rows[0]];
    }

    console.log('✅ Найдено маркеров:', markersResult.rows.length);

    // Тестовые данные маршрута с реальными маркерами
    const testRoute = {
      title: 'Тестовый маршрут с реальными маркерами',
      description: 'Описание тестового маршрута',
      start_date: '2025-10-12',
      end_date: '2025-10-13',
      transport_type: ['car'],
      route_data: { test: true },
      total_distance: 100,
      estimated_duration: 120,
      estimated_cost: 500,
      difficulty_level: 1,
      is_public: true,
      tags: ['тест'],
      waypoints: [
        {
          marker_id: markersResult.rows[0].id,
          order_index: 1,
          arrival_time: '09:00',
          departure_time: '10:00',
          duration_minutes: 60,
          notes: 'Первая точка',
          is_overnight: false
        },
        {
          marker_id: markersResult.rows[1].id,
          order_index: 2,
          arrival_time: '11:00',
          departure_time: '12:00',
          duration_minutes: 60,
          notes: 'Вторая точка',
          is_overnight: false
        }
      ]
    };

    console.log('📝 Тестовые данные с маркерами:', JSON.stringify(testRoute.waypoints, null, 2));

    // Проверяем подключение к БД
    console.log('\n🔍 Проверяем подключение к БД...');
    const dbTest = await pool.query('SELECT NOW()');
    console.log('✅ БД подключена, время:', dbTest.rows[0].now);

    // Пробуем создать маршрут
    console.log('\n🔍 Создаем маршрут...');
    const routeResult = await pool.query(`
      INSERT INTO travel_routes (
        creator_id, title, description, start_date, end_date, transport_type, route_data, 
        total_distance, estimated_duration, estimated_cost, difficulty_level, is_public, tags, 
        created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW()) RETURNING *
    `, [
      testUserId, 
      testRoute.title, 
      testRoute.description, 
      testRoute.start_date, 
      testRoute.end_date, 
      testRoute.transport_type, 
      JSON.stringify(testRoute.route_data), 
      testRoute.total_distance, 
      testRoute.estimated_duration, 
      testRoute.estimated_cost, 
      testRoute.difficulty_level, 
      testRoute.is_public, 
      testRoute.tags
    ]);

    console.log('✅ Маршрут создан:', routeResult.rows[0].id);

    // Пробуем создать waypoints
    console.log('\n🔍 Создаем waypoints...');
    for (const wp of testRoute.waypoints) {
      try {
        await pool.query(`
          INSERT INTO route_waypoints (route_id, marker_id, order_index, arrival_time, departure_time, duration_minutes, notes, is_overnight)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        `, [
          routeResult.rows[0].id, 
          wp.marker_id, 
          wp.order_index, 
          wp.arrival_time, 
          wp.departure_time, 
          wp.duration_minutes, 
          wp.notes, 
          wp.is_overnight
        ]);
        console.log('✅ Waypoint создан:', wp.marker_id);
      } catch (wpErr) {
        console.log('❌ Ошибка создания waypoint:', wpErr.message);
        console.log('Детали ошибки:', wpErr);
      }
    }

    console.log('\n✅ Тест завершен успешно!');

  } catch (error) {
    console.error('❌ Ошибка теста:', error);
    console.error('Stack:', error.stack);
  } finally {
    process.exit();
  }
}

testRouteWithRealMarkers();
