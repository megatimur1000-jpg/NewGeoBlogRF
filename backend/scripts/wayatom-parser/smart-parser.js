const axios = require('axios');
const pool = require('./config/database');

async function smartParse(cityName, maxMarkersPerCategory = 50) {
  try {
    // Получаем границы города
    const cities = require('./config/cities');
    const city = Object.values(cities).find(c => c.name === cityName);
    
    if (!city) {
      return;
    }
    
    const [south, west, north, east] = city.bounds;
    const bbox = `${south},${west},${north},${east}`;
    
    // Категории с приоритетами
    const categories = [
      {
        name: 'attraction',
        priority: 1,
        query: `[out:json][timeout:25];
(
  node["tourism"="attraction"](${bbox});
  node["historic"](${bbox});
  node["amenity"="place_of_worship"](${bbox});
  node["tourism"="museum"](${bbox});
);
out meta;`
      },
      {
        name: 'restaurant',
        priority: 2,
        query: `[out:json][timeout:25];
(
  node["amenity"="restaurant"](${bbox});
  node["amenity"="cafe"](${bbox});
);
out meta;`
      },
      {
        name: 'hotel',
        priority: 3,
        query: `[out:json][timeout:25];
node["tourism"="hotel"](${bbox});
out meta;`
      }
    ];
    
    let totalAdded = 0;
    
    for (const category of categories) {
      `);
      
      try {
        const response = await axios.post('https://overpass-api.de/api/interpreter', category.query, {
          timeout: 30000,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8'
          }
        });
        
        const elements = response.data.elements || [];
        // Ограничиваем количество маркеров
        const limitedElements = elements.slice(0, maxMarkersPerCategory);
        for (const element of limitedElements) {
          if (element.tags && element.tags.name) {
            try {
              // Проверяем дубликаты
              const existsResult = await pool.query(
                'SELECT id FROM map_markers WHERE title = $1 AND ABS(latitude - $2) < 0.001 AND ABS(longitude - $3) < 0.001 LIMIT 1',
                [element.tags.name, element.lat, element.lon]
              );
              
              if (existsResult.rows.length > 0) {
                continue;
              }
              
              // Создаем умное описание
              let description = createSmartDescription(element, category.name, cityName);
              
              // Добавляем маркер
              const result = await pool.query(`
                INSERT INTO map_markers (
                  title, description, latitude, longitude, 
                  category, marker_type, author_name, hashtags,
                  is_verified, is_active, visibility, metadata
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
                ) RETURNING id
              `, [
                element.tags.name,
                description,
                element.lat,
                element.lon,
                category.name,
                'standard',
                'Администратор',
                [cityName.toLowerCase(), category.name, 'умный-парсинг'],
                true,
                true,
                'public',
                {
                  source: 'overpass',
                  tags: element.tags,
                  parsed_at: new Date().toISOString(),
                  is_edited: false,
                  city: cityName,
                  priority: category.priority
                }
              ]);
              
              totalAdded++;
              
            } catch (error) {
              }
          }
        }
        
      } catch (error) {
        }
      
      // Задержка между категориями
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    } catch (error) {
    } finally {
    await pool.end();
  }
}

function createSmartDescription(element, category, cityName) {
  const tags = element.tags;
  let description = `${tags.name} - `;
  
  // Создаем описание на основе тегов
  if (tags.historic) {
    description += `исторический объект в ${cityName}`;
  } else if (tags.amenity === 'place_of_worship') {
    description += `храм в ${cityName}`;
  } else if (tags.tourism === 'museum') {
    description += `музей в ${cityName}`;
  } else if (tags.amenity === 'restaurant') {
    description += `ресторан в ${cityName}`;
  } else if (tags.amenity === 'cafe') {
    description += `кафе в ${cityName}`;
  } else if (tags.tourism === 'hotel') {
    description += `отель в ${cityName}`;
  } else {
    description += `интересное место в ${cityName}`;
  }
  
  // Добавляем дополнительную информацию
  if (tags.opening_hours) {
    description += `. Часы работы: ${tags.opening_hours}`;
  }
  
  if (tags.phone) {
    description += `. Телефон: ${tags.phone}`;
  }
  
  return description;
}

// Запуск парсера
const cityName = process.argv[2] || 'Владимир';
const maxMarkers = parseInt(process.argv[3]) || 50;

`);
smartParse(cityName, maxMarkers);