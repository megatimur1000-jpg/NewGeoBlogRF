import pool from './db.js';
import { calculateMarkerCompleteness } from './src/utils/markerCompleteness.js';

async function testCompletenessSystem() {
  console.log('🧪 Тестируем систему оценки полноты меток...\n');
  
  try {
    // Получаем несколько меток для тестирования
    const markersResult = await pool.query(`
      SELECT * FROM map_markers 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (markersResult.rows.length === 0) {
      console.log('❌ Нет меток для тестирования');
      return;
    }
    
    console.log(`📍 Найдено ${markersResult.rows.length} меток для анализа\n`);
    
    for (const marker of markersResult.rows) {
      console.log(`\n📌 Анализ метки: "${marker.title}" (ID: ${marker.id})`);
      console.log(`📍 Категория: ${marker.category || 'не указана'}`);
      console.log(`📍 Координаты: ${marker.latitude}, ${marker.longitude}`);
      
      // Рассчитываем полноту
      const completeness = calculateMarkerCompleteness(marker);
      
      console.log(`\n🎯 Результаты анализа:`);
      console.log(`   Балл полноты: ${completeness.score}%`);
      console.log(`   Статус: ${completeness.status}`);
      console.log(`   Заполнено полей: ${completeness.filledRequiredFields}/${completeness.totalRequiredFields}`);
      console.log(`   Требует дополнения: ${completeness.needsCompletion ? 'Да' : 'Нет'}`);
      
      if (completeness.suggestions.length > 0) {
        console.log(`\n💡 Предложения по улучшению:`);
        completeness.suggestions.forEach((suggestion, index) => {
          console.log(`   ${index + 1}. [${suggestion.priority.toUpperCase()}] ${suggestion.field}: ${suggestion.message} (+${suggestion.weight}%)`);
        });
      } else {
        console.log(`   ✅ Никаких улучшений не требуется!`);
      }
      
      // Обновляем данные в базе
      try {
        await pool.query(`
          UPDATE map_markers 
          SET 
            completeness_score = $1,
            required_fields_filled = $2,
            total_required_fields = $3,
            needs_completion = $4,
            completion_suggestions = $5
          WHERE id = $6
        `, [
          completeness.score,
          completeness.filledRequiredFields,
          completeness.totalRequiredFields,
          completeness.needsCompletion,
          JSON.stringify(completeness.suggestions),
          marker.id
        ]);
        
        console.log(`   ✅ Данные обновлены в базе`);
      } catch (updateError) {
        console.log(`   ❌ Ошибка обновления в базе: ${updateError.message}`);
      }
      
      console.log(`   ${'─'.repeat(50)}`);
    }
    
    // Статистика по базе
    console.log(`\n📊 Общая статистика по базе:`);
    
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_markers,
        AVG(completeness_score) as avg_score,
        COUNT(*) FILTER (WHERE needs_completion = true) as need_completion,
        COUNT(*) FILTER (WHERE completeness_score >= 80) as good_markers,
        COUNT(*) FILTER (WHERE completeness_score < 40) as poor_markers
      FROM map_markers 
      WHERE is_active = true AND completeness_score IS NOT NULL
    `);
    
    if (statsResult.rows.length > 0) {
      const stats = statsResult.rows[0];
      console.log(`   📍 Всего активных меток: ${stats.total_markers}`);
      console.log(`   📈 Средний балл полноты: ${parseFloat(stats.avg_score || 0).toFixed(1)}%`);
      console.log(`   ⚠️  Требуют дополнения: ${stats.need_completion}`);
      console.log(`   ✅ Хорошо заполненных (≥80%): ${stats.good_markers}`);
      console.log(`   ❌ Плохо заполненных (<40%): ${stats.poor_markers}`);
    }
    
    console.log(`\n🎉 Тестирование завершено успешно!`);
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await pool.end();
  }
}

// Запускаем тест
testCompletenessSystem();
