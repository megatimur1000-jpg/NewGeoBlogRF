const axios = require('axios');
const pool = require('./config/database');

async function workingParse() {
  try {
    // Простые запросы для Владимира
    const queries = [
      {
        name: 'attraction',
        query: `[out:json][timeout:25];
node["tourism"="attraction"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'restaurant',
        query: `[out:json][timeout:25];
node["amenity"="restaurant"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'restaurant',
        query: `[out:json][timeout:25];
node["amenity"="cafe"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      }
    ];
    
    let totalAdded = 0;
    
    for (const category of queries) {
      try {
        const response = await axios.post('https://overpass-api.de/api/interpreter', category.query, {
          timeout: 30000,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8'
          }
        });
        
        const elements = response.data.elements || [];
        for (const element of elements) {
          if (element.tags && element.tags.name) {
            try {
              // Проверяем, существует ли уже такой маркер
              const existsResult = await pool.query(
                'SELECT id FROM map_markers WHERE title = $1 AND ABS(latitude - $2) < 0.001 AND ABS(longitude - $3) < 0.001 LIMIT 1',
                [element.tags.name, element.lat, element.lon]
              );
              
              if (existsResult.rows.length > 0) {
                continue;
              }
              
              // Добавляем маркер с минимальным набором полей
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:               const result = await pool.query(`
                INSERT INTO map_markers (
                  title, description, latitude, longitude, 
                  category, marker_type, author_name
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7
                ) RETURNING id
              `, [
                element.tags.name,
                `${element.tags.name} - интересное место во Владимире`,
                element.lat,
                element.lon,
                category.name,
                'standard',
                'Администратор'
              ]);
              
              totalAdded++;
              
            } catch (error) {
              }
          }
        }
        
      } catch (error) {
        }
      
      // Задержка между запросами
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    } catch (error) {
    } finally {
    await pool.end();
  }
}

workingParse();

async function workingParse() {
  try {
    // Простые запросы для Владимира
    const queries = [
      {
        name: 'attraction',
        query: `[out:json][timeout:25];
node["tourism"="attraction"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'restaurant',
        query: `[out:json][timeout:25];
node["amenity"="restaurant"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'restaurant',
        query: `[out:json][timeout:25];
node["amenity"="cafe"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      }
    ];
    
    let totalAdded = 0;
    
    for (const category of queries) {
      try {
        const response = await axios.post('https://overpass-api.de/api/interpreter', category.query, {
          timeout: 30000,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8'
          }
        });
        
        const elements = response.data.elements || [];
        for (const element of elements) {
          if (element.tags && element.tags.name) {
            try {
              // Проверяем, существует ли уже такой маркер
              const existsResult = await pool.query(
                'SELECT id FROM map_markers WHERE title = $1 AND ABS(latitude - $2) < 0.001 AND ABS(longitude - $3) < 0.001 LIMIT 1',
                [element.tags.name, element.lat, element.lon]
              );
              
              if (existsResult.rows.length > 0) {
                continue;
              }
              
              // Добавляем маркер с минимальным набором полей
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:               const result = await pool.query(`
                INSERT INTO map_markers (
                  title, description, latitude, longitude, 
                  category, marker_type, author_name
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7
                ) RETURNING id
              `, [
                element.tags.name,
                `${element.tags.name} - интересное место во Владимире`,
                element.lat,
                element.lon,
                category.name,
                'standard',
                'Администратор'
              ]);
              
              totalAdded++;
              
            } catch (error) {
              }
          }
        }
        
      } catch (error) {
        }
      
      // Задержка между запросами
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    } catch (error) {
    } finally {
    await pool.end();
  }
}

workingParse();



