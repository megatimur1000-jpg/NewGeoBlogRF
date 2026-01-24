import pool from './db.js';
import { generateToken } from './src/utils/jwt.js';

async function testCreateRouteAPI() {
  try {
    console.log('🔍 Тестируем создание маршрута через API...\n');

    const testUserId = 'c0421a84-8760-42bb-8b7c-72f4ed1e2e1b';
    const token = generateToken(testUserId, 'registered');
    console.log('✅ Токен сгенерирован');

    // Получаем существующие маркеры
    const markersResult = await pool.query('SELECT id, title, latitude, longitude FROM map_markers LIMIT 2');
    console.log(`✅ Найдено маркеров: ${markersResult.rows.length}`);

    if (markersResult.rows.length < 2) {
      console.log('❌ Недостаточно маркеров для создания маршрута');
      return;
    }

    // Создаем тестовый маршрут
    const routeData = {
      title: 'Тестовый маршрут API',
      description: 'Маршрут создан через API тест',
      start_date: '2025-10-12',
      end_date: '2025-10-13',
      transport_type: ['car'],
      route_data: {
        points: markersResult.rows.map(marker => ({
          id: marker.id,
          latitude: marker.latitude,
          longitude: marker.longitude,
          title: marker.title,
          description: 'Тестовая точка'
        })),
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
      waypoints: markersResult.rows.map((marker, index) => ({
        marker_id: marker.id,
        order_index: index,
        arrival_time: undefined,
        departure_time: undefined,
        duration_minutes: undefined,
        notes: '',
        is_overnight: false
      }))
    };

    console.log('📤 Отправляем данные маршрута:');
    console.log(JSON.stringify(routeData, null, 2));

    // Создаем маршрут напрямую в БД (имитируем API)
    console.log('\n🔍 Создаем маршрут в БД...');
    const routeResult = await pool.query(`
      INSERT INTO travel_routes (
        creator_id, title, description, start_date, end_date, transport_type, route_data, 
        total_distance, estimated_duration, estimated_cost, difficulty_level, is_public, tags, 
        created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW()) RETURNING *
    `, [
      testUserId, 
      routeData.title, 
      routeData.description, 
      routeData.start_date, 
      routeData.end_date, 
      routeData.transport_type, 
      JSON.stringify(routeData.route_data), 
      routeData.total_distance, 
      routeData.estimated_duration, 
      routeData.estimated_cost, 
      routeData.difficulty_level, 
      routeData.is_public, 
      routeData.tags
    ]);

    console.log('✅ Маршрут создан:', routeResult.rows[0].id);

    // Создаем waypoints
    console.log('\n🔍 Создаем waypoints...');
    for (const wp of routeData.waypoints) {
      const arrivalTimestamp = wp.arrival_time ? new Date(`2025-10-12T${wp.arrival_time}:00`).toISOString() : null;
      const departureTimestamp = wp.departure_time ? new Date(`2025-10-12T${wp.departure_time}:00`).toISOString() : null;
      
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
      console.log(`✅ Waypoint создан: ${wp.marker_id}`);
    }

    // Проверяем созданный маршрут
    console.log('\n🔍 Проверяем созданный маршрут...');
    const checkResult = await pool.query(`
      SELECT r.*, 
        json_agg(
          json_build_object(
            'id', rw.marker_id,
            'order_index', rw.order_index,
            'arrival_time', rw.arrival_time,
            'departure_time', rw.departure_time,
            'duration_minutes', rw.duration_minutes,
            'notes', rw.notes,
            'is_overnight', rw.is_overnight
          ) ORDER BY rw.order_index
        ) FILTER (WHERE rw.marker_id IS NOT NULL) as waypoints
      FROM travel_routes r
      LEFT JOIN route_waypoints rw ON r.id = rw.route_id
      WHERE r.id = $1
      GROUP BY r.id
    `, [routeResult.rows[0].id]);

    const route = checkResult.rows[0];
    console.log('✅ Маршрут найден:', route.title);
    console.log('📍 Waypoints:', route.waypoints ? route.waypoints.length : 0);
    console.log('📊 Route_data points:', route.route_data?.points ? route.route_data.points.length : 0);

    if (route.route_data?.points) {
      console.log('📍 Координаты точек в route_data:');
      route.route_data.points.forEach((point, index) => {
        console.log(`  ${index + 1}. ${point.title}: [${point.latitude}, ${point.longitude}]`);
      });
    }

    if (route.waypoints) {
      console.log('📍 Waypoints с координатами:');
      for (const wp of route.waypoints) {
        const marker = markersResult.rows.find(m => m.id === wp.id);
        if (marker) {
          console.log(`  ${wp.order_index + 1}. ${marker.title}: [${marker.latitude}, ${marker.longitude}]`);
        }
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

testCreateRouteAPI();
