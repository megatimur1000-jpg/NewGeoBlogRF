const overpassService = require('../services/overpassService');
const wikipediaService = require('../services/wikipediaService');
const databaseService = require('../services/databaseService');
const validator = require('../utils/validator');
const logger = require('../utils/logger');
const categories = require('../config/categories');
const fs = require('fs');
const path = require('path');

class CityParser {
  constructor() {
    this.delay = parseInt(process.env.DELAY_BETWEEN_REQUESTS) || 1000;
    this.batchSize = parseInt(process.env.BATCH_SIZE) || 50;
    this.seenStoreFile = path.join(__dirname, '..', 'progress', 'seen-ids.json');
    this.seenIds = this.loadSeenIds();
    
    // Маппинг русских названий категорий на английские
    this.categoryMapping = {
      'Достопримечательности': 'attraction',
      'Музеи': 'culture',
      'Рестораны': 'restaurant',
      'Отели': 'hotel',
      'Парки': 'nature',
      'Торговля': 'shopping',
      'Транспорт': 'transport',
      'Здравоохранение': 'healthcare',
      'Образование': 'education',
      'Развлечения': 'entertainment',
      'Услуги': 'services',
      'Природа': 'nature'
    };
  }

  loadSeenIds() {
    try {
      if (fs.existsSync(this.seenStoreFile)) {
        const data = JSON.parse(fs.readFileSync(this.seenStoreFile, 'utf8'));
        if (Array.isArray(data)) return new Set(data);
        if (data && Array.isArray(data.ids)) return new Set(data.ids);
      }
    } catch (e) {
      logger.warn(`Не удалось загрузить seen-ids.json: ${e.message}`);
    }
    return new Set();
  }

  saveSeenIds() {
    try {
      const dir = path.dirname(this.seenStoreFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.seenStoreFile, JSON.stringify([...this.seenIds], null, 2));
    } catch (e) {
      logger.warn(`Не удалось сохранить seen-ids.json: ${e.message}`);
    }
  }

  buildUniqueId(poi, category) {
    if (poi.osm_id) {
      return `osm_${poi.osm_id}`;
    }
    const catKey = (this.categoryMapping[category.name] || String(category.name || 'other')).toLowerCase();
    const lat = Number(poi.latitude).toFixed(6);
    const lng = Number(poi.longitude).toFixed(6);
    return `${catKey}_${lat}_${lng}`;
  }

  async parseCity(cityConfig) {
    const cityName = cityConfig.country ? `${cityConfig.name}, ${cityConfig.country}` : cityConfig.name;
    logger.info(`🏙️ Начинаем парсинг города: ${cityName}`);
    
    let totalAdded = 0;
    
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:     for (const [categoryKey, category] of Object.entries(categories)) {
      logger.info(`📂 Парсинг категории: ${category.name}`);
      
      try {
        const pois = await overpassService.queryPOIs(category, cityConfig.bounds);
        logger.info(`Найдено ${pois.length} объектов в категории ${category.name}`);
        
        const processed = await this.processPOIs(pois, category, cityName);
        totalAdded += processed;
        
        // Задержка между категориями
        await this.sleep(this.delay);
        
      } catch (error) {
        logger.error(`Ошибка парсинга категории ${category.name}: ${error.message}`);
      }
    }
    
    logger.success(`✅ Парсинг города ${cityName} завершен. Добавлено: ${totalAdded} маркеров`);
    return totalAdded;
  }

  async processPOIs(pois, category, cityName) {
    let addedCount = 0;
    
    for (let i = 0; i < pois.length; i += this.batchSize) {
      const batch = pois.slice(i, i + this.batchSize);
      
      for (const poi of batch) {
        try {
          if (!validator.isValidCoordinate(poi.latitude, poi.longitude)) {
            continue;
          }

          if (!validator.isValidTitle(poi.name)) {
            continue;
          }

          // Глобальная защита от дублей: OSM ID или составной ключ
          const uniqueId = this.buildUniqueId(poi, category);
          if (this.seenIds.has(uniqueId)) {
            continue;
          }

          // Проверяем, существует ли уже такой маркер
          const exists = await databaseService.checkMarkerExists(
            poi.name, 
            poi.latitude, 
            poi.longitude
          );

          if (exists) {
            // всё равно помечаем как увиденный, чтобы не пытаться снова в этом и следующих запусках
            this.seenIds.add(uniqueId);
            continue;
          }

          // Строгая фильтрация: только качественные метки с официальными названиями
          if (!this.isQualityMarker(poi)) {
            logger.warn(`Отфильтрован низкокачественный маркер: ${poi.name || 'без названия'}`);
            continue;
          }
          
          // Подготавливаем данные маркера (только геопозиция, название и категория)
          const sanitizedTitle = validator.sanitizeTitle(poi.name);
          
          // Дополнительная проверка: если санитизация вернула пустую строку, пропускаем
          if (!sanitizedTitle || sanitizedTitle.trim().length === 0) {
            logger.warn(`Отфильтрован маркер с пустым названием после санитизации: ${poi.name || 'без названия'}`);
            continue;
          }
          
          const markerData = {
            title: sanitizedTitle,
            description: '', // Пустое описание - пользователи будут дополнять
            latitude: poi.latitude,
            longitude: poi.longitude,
            address: poi.address || '',
            category: this.categoryMapping[category.name] || 'other',
            subcategory: this.selectSubcategory(poi.tags, category.subcategories),
            hashtags: validator.generateHashtags(poi.name, category.name, cityName),
            metadata: {
              osm_id: poi.osm_id,
              osm_type: poi.osm_type,
              source: 'openstreetmap',
              parsed_at: new Date().toISOString(),
              needs_completion: true // Флаг что маркер требует дополнения
            }
          };

          // Сохраняем в базу данных
          const markerId = await databaseService.insertMarker(markerData);
          
          if (markerId) {
            addedCount++;
            logger.info(`➕ Добавлен: ${poi.name}`);
            this.seenIds.add(uniqueId);
            // сохраняем по мере добавления, чтобы переживать перезапуски
            this.saveSeenIds();
          }

          // Задержка между запросами
          await this.sleep(this.delay / 2);
          
        } catch (error) {
          logger.error(`Ошибка обработки POI ${poi.name}: ${error.message}`);
        }
      }
    }
    
    return addedCount;
  }

  isQualityMarker(poi) {
    // СТРОГАЯ проверка наличия названия
    if (!poi.name || poi.name === null || typeof poi.name !== 'string' || poi.name.trim().length === 0) {
      return false;
    }

    const name = poi.name.trim();
    
    // Отклоняем слишком короткие названия
    if (name.length < 3) {
      return false;
    }

    // Отклоняем названия только из цифр
    if (/^\d+$/.test(name)) {
      return false;
    }

    // Отклоняем названия только из символов (без букв)
    if (!/[а-яёa-z]/i.test(name)) {
      return false;
    }

    // Отклоняем общие названия без конкретики
    const genericNames = [
      'магазин', 'кафе', 'ресторан', 'отель', 'парк', 'сквер', 'площадь',
      'улица', 'дом', 'здание', 'сооружение', 'объект', 'место', 'точка',
      'shop', 'cafe', 'restaurant', 'hotel', 'park', 'square', 'street',
      'building', 'structure', 'object', 'place', 'point', 'unnamed',
      'без названия', 'неизвестно', 'неизвестное место', 'название отсутствует'
    ];
    
    const lowerName = name.toLowerCase();
    
    // Отклоняем если название состоит ТОЛЬКО из одного из этих слов
    // НО разрешаем если есть дополнительные слова (например, "Хинкальный дом", "Вкусно и точка")
    if (genericNames.includes(lowerName)) {
      return false;
    }
    
    // Отклоняем если название состоит ТОЛЬКО из общих слов без дополнительной информации
    const words = lowerName.split(/\s+/);
    if (words.length === 1 && genericNames.includes(words[0])) {
      return false;
    }
    
    // Отклоняем если все слова в названии - общие (например, "кафе ресторан")
    if (words.every(word => genericNames.includes(word))) {
      return false;
    }
    
    // Отклоняем названия с неполной информацией
    if (lowerName.includes('???') || lowerName.includes('...') || 
        lowerName.includes('неизвестно') || lowerName.includes('без названия') ||
        lowerName.includes('название отсутствует') || lowerName.includes('unnamed')) {
      return false;
    }

    // Если все проверки пройдены - маркер качественный
    return true;
  }

  selectSubcategory(tags, subcategories) {
    // Простая логика выбора подкатегории на основе тегов OSM
    if (tags.tourism === 'museum') return 'музей';
    if (tags.amenity === 'restaurant') return 'ресторан';
    if (tags.amenity === 'cafe') return 'кафе';
    if (tags.tourism === 'hotel') return 'отель';
    if (tags.leisure === 'park') return 'парк';
    if (tags.historic) return 'историческое место';
    
    // Возвращаем случайную подкатегорию из доступных
    return subcategories[Math.floor(Math.random() * subcategories.length)];
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new CityParser();


