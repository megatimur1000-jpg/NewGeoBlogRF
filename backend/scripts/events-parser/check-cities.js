#!/usr/bin/env node

const citiesConfig = require('../wayatom-parser/config/cities');
const fs = require('fs').promises;
const path = require('path');

function flattenCities(config) {
  const flat = [];
  
  Object.values(config.regions).forEach(region => {
    Object.values(region.subjects).forEach(subject => {
      subject.cities.forEach(city => {
        flat.push({
          key: `${region.name}_${subject.name}_${city.name}`.replace(/\s+/g, '_').toLowerCase(),
          name: city.name,
          subject: subject.name,
          region: region.name,
          priority: city.priority || 5,
          bounds: city.bounds
        });
      });
    });
  });
  
  return flat.sort((a, b) => a.name.localeCompare(b.name));
}

async function checkProgress() {
  const progressFile = path.join(__dirname, 'progress', 'events-progress.json');
  let progress = { completed: [], total_events: 0 };
  
  try {
    const data = await fs.readFile(progressFile, 'utf8');
    progress = JSON.parse(data);
  } catch (error) {
    // Файл не существует или пустой
  }
  
  const cities = flattenCities(citiesConfig);
  
  console.log('\n📊 Статистика по городам:');
  console.log('─────────────────────────────────────');
  console.log(`Всего городов в конфигурации: ${cities.length}`);
  console.log(`Обработано городов: ${progress.completed.length}`);
  console.log(`Не обработано: ${cities.length - progress.completed.length}`);
  console.log(`Всего событий: ${progress.total_events}`);
  
  // Группировка по регионам
  const byRegion = {};
  const completedByRegion = {};
  
  cities.forEach(city => {
    if (!byRegion[city.region]) {
      byRegion[city.region] = [];
      completedByRegion[city.region] = [];
    }
    byRegion[city.region].push(city);
    if (progress.completed.includes(city.key)) {
      completedByRegion[city.region].push(city);
    }
  });
  
  console.log('\n📋 Статистика по регионам:');
  console.log('─────────────────────────────────────');
  
  Object.keys(byRegion).sort().forEach(region => {
    const total = byRegion[region].length;
    const completed = completedByRegion[region].length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const status = completed === total ? '✅' : completed > 0 ? '🟡' : '❌';
    
    console.log(`${status} ${region}: ${completed}/${total} (${percentage}%)`);
    
    // Показываем необработанные города для регионов с низким процентом
    if (percentage < 50 && total > 0) {
      const notCompleted = byRegion[region].filter(c => !progress.completed.includes(c.key));
      if (notCompleted.length > 0 && notCompleted.length <= 10) {
        console.log(`   Не обработано: ${notCompleted.map(c => c.name).join(', ')}`);
      }
    }
  });
  
  // Группировка по приоритетам
  const byPriority = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  cities.forEach(city => {
    const priority = city.priority || 5;
    byPriority[priority].push(city);
  });
  
  console.log('\n📊 Статистика по приоритетам:');
  console.log('─────────────────────────────────────');
  console.log(`Приоритет 1 (крупные города): ${byPriority[1].length} городов`);
  console.log(`Приоритет 2 (средние города): ${byPriority[2].length} городов`);
  console.log(`Приоритет 3 (малые города/районные центры): ${byPriority[3].length} городов`);
  console.log(`Приоритет 4-5 (остальные): ${byPriority[4].length + byPriority[5].length} городов`);
  
  // Список регионов без обработанных городов
  const regionsWithoutEvents = Object.keys(byRegion).filter(region => 
    completedByRegion[region].length === 0 && byRegion[region].length > 0
  );
  
  if (regionsWithoutEvents.length > 0) {
    console.log('\n⚠️  Регионы без обработанных событий:');
    console.log('─────────────────────────────────────');
    regionsWithoutEvents.forEach(region => {
      console.log(`❌ ${region}: ${byRegion[region].length} городов`);
    });
  }
}

checkProgress().catch(error => {
  console.error('Ошибка:', error);
  process.exit(1);
});

