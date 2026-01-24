import pool from './db.js';

async function checkAllRoutes() {
  try {
    console.log('🔍 Проверяем все маршруты в базе данных...\n');

    // Получаем все маршруты
    const routesResult = await pool.query(`
      SELECT id, title, creator_id, created_at, route_data
      FROM travel_routes 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    console.log(`✅ Всего маршрутов в БД: ${routesResult.rows.length}`);

    for (const route of routesResult.rows) {
      console.log(`\n🛣️ Маршрут: "${route.title}" (${route.id})`);
      console.log(`👤 Создатель: ${route.creator_id}`);
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
      const waypointsResult = await pool.query(`
        SELECT rw.*, mm.title as marker_title, mm.latitude, mm.longitude
        FROM route_waypoints rw
        LEFT JOIN map_markers mm ON rw.marker_id = mm.id
        WHERE rw.route_id = $1
        ORDER BY rw.order_index
      `, [route.id]);

      console.log(`📍 Waypoints: ${waypointsResult.rows.length}`);
      
      if (waypointsResult.rows.length > 0) {
        waypointsResult.rows.forEach((wp, index) => {
          console.log(`  ${index + 1}. ${wp.marker_title || 'Без названия'} [${wp.latitude}, ${wp.longitude}]`);
        });
      }

      console.log('─'.repeat(60));
    }

    // Проверяем всех пользователей
    console.log('\n👥 Проверяем пользователей...');
    const usersResult = await pool.query(`
      SELECT id, username, email, created_at
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log(`✅ Всего пользователей: ${usersResult.rows.length}`);
    usersResult.rows.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email}) - ${user.id}`);
    });

    console.log('\n✅ Проверка завершена!');

  } catch (error) {
    console.error('❌ Ошибка проверки:', error);
    console.error('Stack:', error.stack);
  } finally {
    process.exit();
  }
}

checkAllRoutes();
