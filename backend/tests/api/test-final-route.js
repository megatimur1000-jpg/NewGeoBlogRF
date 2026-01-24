import pool from './db.js';

async function testFinalRoute() {
  try {
    console.log('🔍 Финальный тест создания маршрута...\n');

    const testUserId = 'c0421a84-8760-42bb-8b7c-72f4ed1e2e1b';

    // Получаем реальные маркеры
    const markersResult = await pool.query('SELECT id FROM map_markers LIMIT 2');
    console.log('✅ Найдено маркеров:', markersResult.rows.length);

    const testRoute = {
      title: 'Финальный тест маршрута',
      description: 'Описание',
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
        }
      ]
    };

    // Создаем маршрут
    console.log('🔍 Создаем маршрут...');
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

    // Создаем waypoints с правильным timestamp
    console.log('🔍 Создаем waypoints...');
    for (const wp of testRoute.waypoints) {
      const arrivalTimestamp = wp.arrival_time ? new Date(`2025-10-12T${wp.arrival_time}:00`).toISOString() : null;
      const departureTimestamp = wp.departure_time ? new Date(`2025-10-12T${wp.departure_time}:00`).toISOString() : null;
      
      console.log('Время прибытия:', arrivalTimestamp);
      console.log('Время отправления:', departureTimestamp);
      
      await pool.query(`
        INSERT INTO route_waypoints (route_id, marker_id, order_index, arrival_time, departure_time, duration_minutes, notes, is_overnight)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `, [
        routeResult.rows[0].id, 
        wp.marker_id, 
        wp.order_index, 
        arrivalTimestamp, 
        departureTimestamp, 
        wp.duration_minutes, 
        wp.notes, 
        wp.is_overnight
      ]);
      console.log('✅ Waypoint создан успешно!');
    }

    console.log('\n✅ Финальный тест завершен успешно!');

  } catch (error) {
    console.error('❌ Ошибка финального теста:', error);
    console.error('Stack:', error.stack);
  } finally {
    process.exit();
  }
}

testFinalRoute();
