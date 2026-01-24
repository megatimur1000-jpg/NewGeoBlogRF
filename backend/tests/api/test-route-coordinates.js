import pool from './db.js';
// SONAR-AUTO-FIX (javascript:S1128): original: import { generateToken } from './src/utils/jwt.js';

async function testRouteCoordinates() {
  try {
    console.log('🔍 Проверяем координаты маршрутов и их точек...\n');

    const testUserId = 'c0421a84-8760-42bb-8b7c-72f4ed1e2e1b';

    // Получаем последние маршруты пользователя
    console.log('📋 Получаем маршруты пользователя...');
    const routesResult = await pool.query(`
      SELECT id, title, created_at, route_data
      FROM travel_routes 
      WHERE creator_id = $1 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [testUserId]);

    console.log(`✅ Найдено маршрутов: ${routesResult.rows.length}`);

    for (const route of routesResult.rows) {
      console.log(`\n🛣️ Маршрут: "${route.title}" (${route.id})`);
      console.log(`📅 Создан: ${route.created_at}`);

      // Проверяем route_data
      if (route.route_data) {
        console.log('📊 Route_data:');
        console.log('  - points:', route.route_data.points ? route.route_data.points.length : 'НЕТ');
        if (route.route_data.points && route.route_data.points.length > 0) {
          console.log('  - Первая точка:', {
            id: route.route_data.points[0].id,
            latitude: route.route_data.points[0].latitude,
            longitude: route.route_data.points[0].longitude,
            title: route.route_data.points[0].title
          });
        }
      } else {
        console.log('❌ Route_data: ОТСУТСТВУЕТ');
      }

      // Получаем waypoints маршрута
      console.log('📍 Waypoints маршрута:');
      const waypointsResult = await pool.query(`
        SELECT rw.*, mm.title as marker_title, mm.latitude, mm.longitude
        FROM route_waypoints rw
        LEFT JOIN map_markers mm ON rw.marker_id = mm.id
        WHERE rw.route_id = $1
        ORDER BY rw.order_index
      `, [route.id]);

      console.log(`  - Количество waypoints: ${waypointsResult.rows.length}`);
      
      if (waypointsResult.rows.length > 0) {
        console.log('  - Детали waypoints:');
        waypointsResult.rows.forEach((wp, index) => {
          console.log(`    ${index + 1}. ${wp.marker_title || 'Без названия'}`);
          console.log(`       - marker_id: ${wp.marker_id}`);
          console.log(`       - coordinates: [${wp.latitude}, ${wp.longitude}]`);
          console.log(`       - order_index: ${wp.order_index}`);
        });
      } else {
        console.log('  ❌ Waypoints: ОТСУТСТВУЮТ');
      }

      // Проверяем, есть ли связь между route_data.points и waypoints
      if (route.route_data && route.route_data.points && waypointsResult.rows.length > 0) {
        console.log('🔗 Связь между route_data.points и waypoints:');
        const routeDataPoints = route.route_data.points;
        const waypoints = waypointsResult.rows;
        
        console.log(`  - route_data.points: ${routeDataPoints.length} точек`);
        console.log(`  - waypoints: ${waypoints.length} точек`);
        
        // Проверяем соответствие координат
        let matchingCoordinates = 0;
        for (let i = 0; i < Math.min(routeDataPoints.length, waypoints.length); i++) {
          const routePoint = routeDataPoints[i];
          const waypoint = waypoints[i];
          
          if (waypoint.latitude && waypoint.longitude) {
            const latMatch = Math.abs(routePoint.latitude - waypoint.latitude) < 0.0001;
            const lonMatch = Math.abs(routePoint.longitude - waypoint.longitude) < 0.0001;
            
            if (latMatch && lonMatch) {
              matchingCoordinates++;
            } else {
              console.log(`    ❌ Несоответствие в точке ${i + 1}:`);
              console.log(`       route_data: [${routePoint.latitude}, ${routePoint.longitude}]`);
              console.log(`       waypoint: [${waypoint.latitude}, ${waypoint.longitude}]`);
            }
          } else {
            console.log(`    ❌ Waypoint ${i + 1} без координат`);
          }
        }
        
        console.log(`  ✅ Совпадающих координат: ${matchingCoordinates}/${Math.min(routeDataPoints.length, waypoints.length)}`);
      }

      console.log('─'.repeat(80));
    }

    // Проверяем все маркеры пользователя
    console.log('\n🗺️ Проверяем все маркеры пользователя...');
    const markersResult = await pool.query(`
      SELECT id, title, latitude, longitude, created_at
      FROM map_markers 
      WHERE creator_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [testUserId]);

    console.log(`✅ Найдено маркеров: ${markersResult.rows.length}`);
    
    if (markersResult.rows.length > 0) {
      console.log('📍 Последние маркеры:');
      markersResult.rows.forEach((marker, index) => {
        console.log(`  ${index + 1}. "${marker.title}"`);
        console.log(`     - ID: ${marker.id}`);
        console.log(`     - Координаты: [${marker.latitude}, ${marker.longitude}]`);
        console.log(`     - Создан: ${marker.created_at}`);
      });
    }

    console.log('\n✅ Проверка завершена!');

  } catch (error) {
    console.error('❌ Ошибка проверки:', error);
    console.error('Stack:', error.stack);
  } finally {
    process.exit();
  }
}

testRouteCoordinates();

