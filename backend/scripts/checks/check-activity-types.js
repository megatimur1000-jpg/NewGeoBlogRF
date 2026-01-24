// Проверка типов активности в базе данных
import pool from './db.js';

async function checkActivityTypes() {
  try {
    // Проверяем типы активности
    const activityTypesQuery = `
      SELECT unnest(enum_range(NULL::activity_type)) as activity_type
      ORDER BY activity_type;
    `;
    
    const activityTypesResult = await pool.query(activityTypesQuery);
    activityTypesResult.rows.forEach(row => {
      });

    // Проверяем типы целей
    const targetTypesQuery = `
      SELECT unnest(enum_range(NULL::target_type)) as target_type
      ORDER BY target_type;
    `;
    
    const targetTypesResult = await pool.query(targetTypesQuery);
    targetTypesResult.rows.forEach(row => {
      });

  } catch (error) {
    } finally {
    await pool.end();
  }
}

checkActivityTypes();
