#!/usr/bin/env node

// Загружаем переменные окружения из разных возможных мест
require('dotenv').config(); // Пробуем загрузить из .env в корне проекта
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') }); // Пробуем из backend/.env
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') }); // Пробуем из корня проекта
require('dotenv').config({ path: require('path').join(__dirname, '../wayatom-parser/config.env') }); // Пробуем из config.env

const { Pool } = require('pg');
const axios = require('axios');
const logger = require('../wayatom-parser/utils/logger');
const chalk = require('chalk');

// Создаем пул подключений
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'bestsite',
  user: 'bestuser_temp',
  password: '55555',
});

// Функция геокодирования адреса через Yandex Geocoder
async function geocodeAddress(address) {
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    return null;
  }

  try {
    // Пробуем получить ключ из разных возможных переменных окружения
    const yandexApiKey = process.env.VITE_YANDEX_MAPS_API_KEY 
      || process.env.YANDEX_MAPS_API_KEY 
      || process.env.YANDEX_API_KEY
      || process.env.YANDEX_GEOCODER_API_KEY;
    
    if (!yandexApiKey) {
      logger.warn('Yandex Maps API key not found. Проверьте переменные окружения:');
      logger.warn('  - VITE_YANDEX_MAPS_API_KEY');
      logger.warn('  - YANDEX_MAPS_API_KEY');
      logger.warn('  - YANDEX_API_KEY');
      logger.warn('  - YANDEX_GEOCODER_API_KEY');
      logger.warn('Убедитесь, что ключ указан в .env файле в корне проекта или в backend/.env');
      return null;
    }

    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${yandexApiKey}&format=json&geocode=${encodeURIComponent(address)}&lang=ru_RU&results=1`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Geoblog-Events-Parser/1.0'
      },
      timeout: 5000 // 5 секунд таймаут
    });

    if (response.status !== 200) {
      logger.warn(`Yandex Geocoder error: ${response.status}`);
      return null;
    }

    const data = response.data;
    
    if (data?.response?.GeoObjectCollection?.featureMember?.length > 0) {
      const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
      const pos = geoObject.Point.pos.split(' ').map(Number); // 'lon lat'
      const [longitude, latitude] = pos;
      
      return { latitude, longitude };
    }
    
    return null;
  } catch (error) {
    logger.warn(`Geocoding error for "${address}": ${error.message}`);
    return null;
  }
}

async function updateEventCoordinates() {
  logger.info(chalk.blue('🚀 Начинаем обновление координат событий...'));
  logger.info(chalk.gray('─────────────────────────────────────\n'));

  try {
    // Получаем все события без координат
    const result = await pool.query(`
      SELECT id, title, location 
      FROM events 
      WHERE latitude IS NULL OR longitude IS NULL
      ORDER BY created_at ASC
    `);

    const eventsToUpdate = result.rows;
    logger.info(chalk.cyan(`📋 Найдено событий без координат: ${eventsToUpdate.length}\n`));

    if (eventsToUpdate.length === 0) {
      logger.info(chalk.green('✅ Все события уже имеют координаты!'));
      await pool.end();
      return;
    }

    let updatedCount = 0;
    let failedCount = 0;

    for (const event of eventsToUpdate) {
      try {
        if (!event.location) {
          logger.warn(chalk.yellow(`⚠️  Событие "${event.title}" (ID: ${event.id}) не имеет адреса, пропускаем`));
          failedCount++;
          continue;
        }

        logger.info(chalk.gray(`📍 Геокодируем: "${event.title}" - ${event.location}`));
        
        const geocoded = await geocodeAddress(event.location);
        
        if (geocoded && geocoded.latitude && geocoded.longitude) {
          // Обновляем координаты в БД
          await pool.query(
            `UPDATE events 
             SET latitude = $1, longitude = $2, updated_at = NOW() 
             WHERE id = $3`,
            [geocoded.latitude, geocoded.longitude, event.id]
          );
          
          updatedCount++;
          logger.info(chalk.green(`✅ Обновлено: "${event.title}" - [${geocoded.latitude}, ${geocoded.longitude}]`));
        } else {
          logger.warn(chalk.yellow(`⚠️  Не удалось геокодировать: "${event.title}" - ${event.location}`));
          failedCount++;
        }

        // КРИТИЧНО: Увеличиваем задержку между запросами, чтобы не превысить лимиты API
        // 500мс между запросами = максимум 2 запроса в секунду = 7200 запросов в час
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        logger.error(chalk.red(`❌ Ошибка при обновлении события "${event.title}": ${error.message}`));
        failedCount++;
      }
    }

    logger.info(chalk.blue('\n📊 Результаты обновления:'));
    logger.info(chalk.gray('─────────────────────────────────────'));
    logger.info(chalk.green(`✅ Обновлено: ${updatedCount}`));
    logger.info(chalk.yellow(`⚠️  Не удалось: ${failedCount}`));
    logger.info(chalk.white(`📋 Всего обработано: ${eventsToUpdate.length}\n`));

  } catch (error) {
    logger.error(chalk.red(`💥 Критическая ошибка: ${error.message}`));
  } finally {
    await pool.end();
  }
}

// Запуск скрипта
if (require.main === module) {
  updateEventCoordinates().catch(error => {
    logger.error(chalk.red('💥 Критическая ошибка:'), error);
    process.exit(1);
  });
}

module.exports = { updateEventCoordinates };

