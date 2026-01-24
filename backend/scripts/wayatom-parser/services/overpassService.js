const axios = require('axios');
const logger = require('../utils/logger');

class OverpassService {
  constructor() {
    this.baseUrl = 'https://overpass-api.de/api/interpreter';
    this.timeout = 30000;
  }

  async queryPOIs(category, bounds) {
    try {
      const [south, west, north, east] = bounds;
      const bbox = `${south},${west},${north},${east}`;
      
      const query = category.overpass_query.replace(/{{bbox}}/g, bbox);
      
      logger.info(`Запрос к Overpass API для категории: ${category.name}`);
      logger.info(`Bbox: ${bbox}`);
      logger.info(`Query: ${query.substring(0, 200)}...`);
      
      const response = await axios.post(this.baseUrl, query, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8'
        }
      });

      const elements = response.data.elements || [];
      logger.info(`Получено ${elements.length} объектов для категории ${category.name}`);
      
      return this.processElements(elements);
    } catch (error) {
      logger.error(`Ошибка запроса к Overpass API: ${error.message}`);
      if (error.response) {
        logger.error(`Статус: ${error.response.status}`);
        logger.error(`Ответ: ${error.response.data}`);
      }
      return [];
    }
  }

  processElements(elements) {
    return elements.map(element => {
      let lat, lon;
      
      if (element.type === 'node') {
        lat = element.lat;
        lon = element.lon;
      } else if (element.center) {
        lat = element.center.lat;
        lon = element.center.lon;
      } else {
        return null;
      }

      const tags = element.tags || {};
      
      return {
        osm_id: element.id,
        osm_type: element.type,
        name: tags.name || tags['name:ru'] || null, // Не устанавливаем "Без названия" по умолчанию
        latitude: lat,
        longitude: lon,
        tags: tags,
        address: this.buildAddress(tags)
      };
    }).filter(Boolean);
  }

  buildAddress(tags) {
    const parts = [];
    
    if (tags['addr:street']) parts.push(`ул. ${tags['addr:street']}`);
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    
    return parts.length > 0 ? parts.join(', ') : null;
  }
}

module.exports = new OverpassService();