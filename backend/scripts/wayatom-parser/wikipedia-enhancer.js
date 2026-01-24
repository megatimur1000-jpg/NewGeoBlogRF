const axios = require('axios');
const pool = require('./config/database');

async function getWikipediaDescription(title) {
  try {
    // Ищем в Wikipedia API
    const searchResponse = await axios.get('https://ru.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title), {
      timeout: 5000
    });
    
    if (searchResponse.data && searchResponse.data.extract) {
      return searchResponse.data.extract.substring(0, 500) + '...';
    }
  } catch (error) {
    // Если не найдено, пробуем поиск
    try {
      const searchResponse = await axios.get('https://ru.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          format: 'json',
          list: 'search',
          srsearch: title,
          srlimit: 1
        },
        timeout: 5000
      });
      
      if (searchResponse.data.query.search.length > 0) {
        const pageTitle = searchResponse.data.query.search[0].title;
        const pageResponse = await axios.get(`https://ru.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`, {
          timeout: 5000
        });
        
        if (pageResponse.data && pageResponse.data.extract) {
          return pageResponse.data.extract.substring(0, 500) + '...';
        }
      }
    } catch (searchError) {
      // Игнорируем ошибки поиска
    }
  }
  
  return null;
}

async function enhanceWithWikipedia() {
  try {
    // Получаем маркеры без Wikipedia описаний
    const markers = await pool.query(`
      SELECT id, title, description, metadata 
      FROM map_markers 
      WHERE metadata->>'has_wikipedia' IS NULL
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    for (const marker of markers.rows) {
      try {
        const wikipediaDescription = await getWikipediaDescription(marker.title);
        
        if (wikipediaDescription) {
          // Обновляем маркер с Wikipedia описанием
          await pool.query(`
            UPDATE map_markers 
            SET 
              description = $1,
              metadata = jsonb_set(
                jsonb_set(COALESCE(metadata, '{}'), '{has_wikipedia}', '"true"'),
                '{wikipedia_description}', $2
              )
            WHERE id = $3
          `, [
            wikipediaDescription,
            `"${wikipediaDescription}"`,
            marker.id
          ]);
          
          } else {
          // Помечаем как проверенное, но без Wikipedia
          await pool.query(`
            UPDATE map_markers 
            SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{has_wikipedia}', '"false"')
            WHERE id = $1
          `, [marker.id]);
          
          }
        
        // Задержка между запросами к Wikipedia
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        }
    }
    
    } catch (error) {
    } finally {
    await pool.end();
  }
}

enhanceWithWikipedia();