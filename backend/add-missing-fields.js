import pool from './db.js';

async function addMissingFields() {
  try {
    console.log('🔧 Добавляем недостающие поля в таблицы...\n');
    
    // Добавляем поля в travel_routes
    console.log('📍 Добавляем поля в travel_routes...');
    try {
      await pool.query('ALTER TABLE travel_routes ADD COLUMN IF NOT EXISTS is_user_modified BOOLEAN DEFAULT false');
      console.log('✅ Поле is_user_modified добавлено в travel_routes');
    } catch (err) {
      console.log(`❌ Ошибка добавления is_user_modified: ${err.message}`);
    }
    
    try {
      await pool.query('ALTER TABLE travel_routes ADD COLUMN IF NOT EXISTS used_in_blogs BOOLEAN DEFAULT false');
      console.log('✅ Поле used_in_blogs добавлено в travel_routes');
    } catch (err) {
      console.log(`❌ Ошибка добавления used_in_blogs: ${err.message}`);
    }
    
    // Добавляем поля в events (если нужно)
    console.log('\n📅 Проверяем поля в events...');
    try {
      await pool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS is_user_modified BOOLEAN DEFAULT false');
      console.log('✅ Поле is_user_modified проверено в events');
    } catch (err) {
      console.log(`❌ Ошибка с is_user_modified в events: ${err.message}`);
    }
    
    try {
      await pool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS used_in_blogs BOOLEAN DEFAULT false');
      console.log('✅ Поле used_in_blogs проверено в events');
    } catch (err) {
      console.log(`❌ Ошибка с used_in_blogs в events: ${err.message}`);
    }
    
    // Добавляем поля в map_markers (если нужно)
    console.log('\n🗺️ Проверяем поля в map_markers...');
    try {
      await pool.query('ALTER TABLE map_markers ADD COLUMN IF NOT EXISTS is_user_modified BOOLEAN DEFAULT false');
      console.log('✅ Поле is_user_modified проверено в map_markers');
    } catch (err) {
      console.log(`❌ Ошибка с is_user_modified в map_markers: ${err.message}`);
    }
    
    console.log('\n✅ Все поля проверены и добавлены!');
    
  } catch (error) {
    console.error('❌ Общая ошибка:', error.message);
  } finally {
    await pool.end();
  }
}

addMissingFields();
