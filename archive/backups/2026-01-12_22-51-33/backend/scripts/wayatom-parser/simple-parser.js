const axios = require('axios');
const pool = require('./config/database');
const { v4: uuidv4 } = require('uuid');

async function simpleParse() {
  try {
    // Простые запросы для Владимира
    const queries = [
      {
        name: 'Достопримечательности',
        query: `[out:json][timeout:25];
node["tourism"="attraction"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'Рестораны',
        query: `[out:json][timeout:25];
node["amenity"="restaurant"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'Кафе',
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
              
              // Добавляем маркер
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:               const result = await pool.query(`
                INSERT INTO map_markers (
                  title, description, latitude, longitude, address,
                  category, subcategory, author_name, hashtags, 
                  is_verified, marker_type, rating, rating_count, 
                  views_count, likes_count, comments_count, shares_count, 
                  photo_urls, metadata
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                  $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
                ) RETURNING id
              `, [
                element.tags.name,
                `${element.tags.name} - интересное место во Владимире`,
                element.lat,
                element.lon,
                null,
                category.name,
                'место',
                'Администратор',
                ['владимир', category.name.toLowerCase()],
                true,
                'standard',
                0, 0, 0, 0, 0, 0, [], {}
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

simpleParse();

const { v4: uuidv4 } = require('uuid');

async function simpleParse() {
  try {
    // Простые запросы для Владимира
    const queries = [
      {
        name: 'Достопримечательности',
        query: `[out:json][timeout:25];
node["tourism"="attraction"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'Рестораны',
        query: `[out:json][timeout:25];
node["amenity"="restaurant"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'Кафе',
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
              
              // Добавляем маркер
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:               const result = await pool.query(`
                INSERT INTO map_markers (
                  title, description, latitude, longitude, address,
                  category, subcategory, author_name, hashtags, 
                  is_verified, marker_type, rating, rating_count, 
                  views_count, likes_count, comments_count, shares_count, 
                  photo_urls, metadata
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                  $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
                ) RETURNING id
              `, [
                element.tags.name,
                `${element.tags.name} - интересное место во Владимире`,
                element.lat,
                element.lon,
                null,
                category.name,
                'место',
                'Администратор',
                ['владимир', category.name.toLowerCase()],
                true,
                'standard',
                0, 0, 0, 0, 0, 0, [], {}
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

simpleParse();

