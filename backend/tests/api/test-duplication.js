import pool from './db.js';
import { checkForDuplicateMarkers, getNearbyIncompleteMarkers } from './src/utils/markerDuplication.js';

async function testDuplicationSystem() {
  console.log('🔍 Тестируем систему предотвращения дублирования меток...\n');
  
  try {
    // Получаем несколько существующих меток для тестирования
    const existingMarkersResult = await pool.query(`
      SELECT * FROM map_markers 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    if (existingMarkersResult.rows.length === 0) {
      console.log('❌ Нет меток для тестирования');
      return;
    }
    
    console.log(`📍 Найдено ${existingMarkersResult.rows.length} меток для тестирования дублирования\n`);
    
    for (const [index, marker] of existingMarkersResult.rows.entries()) {
      console.log(`\n🧪 Тест ${index + 1}: Проверка дублирования для "${marker.title}"`);
      console.log(`📍 Оригинальные координаты: ${marker.latitude}, ${marker.longitude}`);
      console.log(`📍 Категория: ${marker.category}`);
      
      // Тест 1: Точный дубликат (те же координаты и название)
      console.log('\n🔬 Тест 1: Точный дубликат');
      try {
        const exactDuplicateCheck = await checkForDuplicateMarkers(
          marker.latitude,
          marker.longitude,
          marker.title,
          { category: marker.category, excludeMarkerId: marker.id }
        );
        
        console.log(`   Дубликатов найдено: ${exactDuplicateCheck.duplicatesCount}`);
        console.log(`   Уровень риска: ${exactDuplicateCheck.analysis.riskLevel}`);
        console.log(`   Можно создать: ${exactDuplicateCheck.analysis.canProceed}`);
        console.log(`   Рекомендация: ${exactDuplicateCheck.recommendation.action}`);
        
      } catch (error) {
        console.log(`   ❌ Ошибка: ${error.message}`);
      }
      
      // Тест 2: Близкие координаты (50 метров от оригинала)
      console.log('\n🔬 Тест 2: Близкие координаты (+0.0005°)');
      try {
        const nearbyCheck = await checkForDuplicateMarkers(
          parseFloat(marker.latitude) + 0.0005, // ~55 метров
          parseFloat(marker.longitude) + 0.0005,
          `Новая ${marker.title}`,
          { category: marker.category }
        );
        
        console.log(`   Дубликатов найдено: ${nearbyCheck.duplicatesCount}`);
        console.log(`   Уровень риска: ${nearbyCheck.analysis.riskLevel}`);
        console.log(`   Можно создать: ${nearbyCheck.analysis.canProceed}`);
        if (nearbyCheck.duplicates.length > 0) {
          console.log(`   Расстояние до ближайшего: ${nearbyCheck.duplicates[0].distance}м`);
          console.log(`   Схожесть названий: ${(nearbyCheck.duplicates[0].titleSimilarity * 100).toFixed(1)}%`);
        }
        
      } catch (error) {
        console.log(`   ❌ Ошибка: ${error.message}`);
      }
      
      // Тест 3: Поиск неполных меток поблизости
      console.log('\n🔬 Тест 3: Поиск неполных меток поблизости');
      try {
        const incompleteNearby = await getNearbyIncompleteMarkers(
          marker.latitude,
          marker.longitude,
          marker.category,
          300 // 300 метров
        );
        
        console.log(`   Неполных меток найдено: ${incompleteNearby.length}`);
        
        if (incompleteNearby.length > 0) {
          incompleteNearby.slice(0, 2).forEach((incomplete, i) => {
            console.log(`   ${i + 1}. "${incomplete.title}" - ${incomplete.completenessScore}% (${incomplete.distance}м)`);
            console.log(`      Возможное улучшение: +${incomplete.estimatedImpact}%`);
          });
        }
        
      } catch (error) {
        console.log(`   ❌ Ошибка: ${error.message}`);
      }
      
      console.log(`   ${'─'.repeat(60)}`);
    }
    
    // Тест 4: Новая метка в пустой области
    console.log(`\n🧪 Тест 4: Новая метка в относительно пустой области`);
    const emptyAreaLat = 55.7558; // Москва, но в стороне от основной массы меток
    const emptyAreaLng = 37.6176;
    
    try {
      const emptyAreaCheck = await checkForDuplicateMarkers(
        emptyAreaLat,
        emptyAreaLng,
        'Новая тестовая метка',
        { category: 'other' }
      );
      
      console.log(`📍 Координаты: ${emptyAreaLat}, ${emptyAreaLng}`);
      console.log(`   Дубликатов найдено: ${emptyAreaCheck.duplicatesCount}`);
      console.log(`   Уровень риска: ${emptyAreaCheck.analysis.riskLevel}`);
      console.log(`   Можно создать: ${emptyAreaCheck.analysis.canProceed}`);
      console.log(`   Сообщение: ${emptyAreaCheck.analysis.message}`);
      
    } catch (error) {
      console.log(`❌ Ошибка: ${error.message}`);
    }
    
    // Статистика по системе
    console.log(`\n📊 Общая статистика системы дублирования:`);
    
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_active_markers,
        COUNT(*) FILTER (WHERE needs_completion = true) as incomplete_markers,
        AVG(completeness_score) as avg_completeness,
        COUNT(DISTINCT creator_id) as unique_creators
      FROM map_markers 
      WHERE is_active = true
    `);
    
    if (statsResult.rows.length > 0) {
      const stats = statsResult.rows[0];
      console.log(`   📍 Всего активных меток: ${stats.total_active_markers}`);
      console.log(`   📝 Неполных меток: ${stats.incomplete_markers} (${((stats.incomplete_markers / stats.total_active_markers) * 100).toFixed(1)}%)`);
      console.log(`   📈 Средняя полнота: ${parseFloat(stats.avg_completeness || 0).toFixed(1)}%`);
      console.log(`   👥 Уникальных создателей: ${stats.unique_creators}`);
    }
    
    console.log(`\n🎉 Тестирование системы дублирования завершено!`);
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании дублирования:', error);
  } finally {
    await pool.end();
  }
}

// Запускаем тест
testDuplicationSystem();
