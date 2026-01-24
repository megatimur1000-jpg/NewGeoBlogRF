import pool from './db.js';

async function checkMarkerIntegrity() {
  try {
    // Получаем все активные маркеры с детальной информацией
    const result = await pool.query(`
      SELECT 
        id,
        title,
        creator_id,
        latitude,
        longitude,
        category,
        is_active,
        visibility,
        created_at,
        CASE 
          WHEN latitude IS NULL THEN 'NULL latitude'
          WHEN longitude IS NULL THEN 'NULL longitude'
          WHEN latitude::text ~ '^[0-9.-]+$' AND longitude::text ~ '^[0-9.-]+$' THEN 'Valid coords'
          ELSE 'Invalid coords format'
        END as coord_status,
        CASE 
          WHEN latitude::numeric < -90 OR latitude::numeric > 90 THEN 'Invalid lat range'
          WHEN longitude::numeric < -180 OR longitude::numeric > 180 THEN 'Invalid lng range'
          ELSE 'Valid coord range'
        END as coord_range_status
      FROM map_markers 
      WHERE is_active = true
      ORDER BY created_at DESC
    `);

    // Группировки и быстрый отчёт по координатам
    const nullCreatorMarkers = result.rows.filter(m => m.creator_id === null);
    const notNullCreatorMarkers = result.rows.filter(m => m.creator_id !== null);

    const validCoordsMarkers = result.rows.filter(m => m.coord_status === 'Valid coords');
    const invalidCoordsMarkers = result.rows.filter(m => m.coord_status !== 'Valid coords');

    const validRangeMarkers = result.rows.filter(m => m.coord_range_status === 'Valid coord range');
    const invalidRangeMarkers = result.rows.filter(m => m.coord_range_status !== 'Valid coord range');

    console.log('Marker integrity summary:', {
      total: result.rows.length,
      nullCreator: nullCreatorMarkers.length,
      withCreator: notNullCreatorMarkers.length,
      validCoords: validCoordsMarkers.length,
      invalidCoords: invalidCoordsMarkers.length,
      validRange: validRangeMarkers.length,
      invalidRange: invalidRangeMarkers.length
    });

    // Проверяем, есть ли маркеры с проблемами и выводим первые 20
    const problematicMarkers = result.rows.filter(m =>
      m.coord_status !== 'Valid coords' ||
      m.coord_range_status !== 'Valid coord range'
    );

    if (problematicMarkers.length > 0) {
      console.log(`Found ${problematicMarkers.length} problematic markers; showing up to 20:`);
      problematicMarkers.slice(0, 20).forEach((marker) => {
        console.log({ id: marker.id, title: marker.title, coord_status: marker.coord_status, coord_range_status: marker.coord_range_status });
      });
    } else {
      console.log('No problematic markers found.');
    }

  } catch (error) {
  } finally {
    await pool.end();
  }
}

checkMarkerIntegrity();


