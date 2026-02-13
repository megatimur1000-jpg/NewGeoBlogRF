// Загружаем переменные окружения из разных возможных мест
require('dotenv').config(); // Пробуем загрузить из .env в корне проекта
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') }); // Пробуем из backend/.env
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') }); // Пробуем из корня проекта
require('dotenv').config({ path: require('path').join(__dirname, '../../wayatom-parser/config.env') }); // Пробуем из config.env

const axios = require('axios');
const logger = require('../../wayatom-parser/utils/logger');
const databaseService = require('../services/databaseService');
const { getUniqueEventsForCity } = require('./uniqueEvents');

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

class EventParser {
  constructor() {
    this.eventsPerCity = 5; // Количество событий на город
    this.eventCategories = [
      {
        name: 'Фестиваль',
        keywords: ['фестиваль', 'festival', 'праздник', 'празднование'],
        description: 'Культурный фестиваль или праздничное мероприятие'
      },
      {
        name: 'Концерт',
        keywords: ['концерт', 'concert', 'музыка', 'выступление'],
        description: 'Музыкальный концерт или выступление'
      },
      {
        name: 'Выставка',
        keywords: ['выставка', 'exhibition', 'экспозиция', 'музей'],
        description: 'Художественная или историческая выставка'
      },
      {
        name: 'Спортивное событие',
        keywords: ['спорт', 'sport', 'соревнование', 'турнир'],
        description: 'Спортивное соревнование или турнир'
      },
      {
        name: 'Ярмарка',
        keywords: ['ярмарка', 'fair', 'рынок', 'базар'],
        description: 'Торговая ярмарка или рынок'
      }
    ];
    
    // Маппинг категорий на допустимые значения event_type в БД
    // Допустимые значения: meetup, festival, conference, trip, workshop, other
    this.categoryToEventTypeMap = {
      'Фестиваль': 'festival',
      'Концерт': 'meetup',
      'Выставка': 'other',
      'Спортивное событие': 'other',
      'Ярмарка': 'other'
    };
  }
  
  // Получить допустимое значение event_type для категории
  getEventType(categoryName) {
    return this.categoryToEventTypeMap[categoryName] || 'other';
  }

  async parseCityEvents(cityConfig, bbox, allowGenerated = false) {
    logger.info(`🎉 Начинаем парсинг событий для города: ${cityConfig.name}`);
    
    let addedCount = 0;
    
    try {
      // Генерируем события для города (уникальные или по шаблонам, если разрешено)
      const events = await this.generateEventsForCity(cityConfig, bbox, allowGenerated);
      
      // Если нет событий - город пропущен
      if (events.length === 0) {
        logger.info(`⏭️  Город ${cityConfig.name} пропущен - нет уникальных событий`);
        return 0;
      }
      
      for (const event of events) {
        try {
          const eventId = await databaseService.insertEvent(event);
          if (eventId) {
            addedCount++;
            logger.info(`➕ Добавлено событие: ${event.title}`);
          }
        } catch (error) {
          logger.error(`Ошибка добавления события ${event.title}: ${error.message}`);
        }
      }
      
      logger.info(`✅ Парсинг событий для ${cityConfig.name} завершен. Добавлено: ${addedCount} уникальных событий`);
      
    } catch (error) {
      logger.error(`Ошибка парсинга событий для ${cityConfig.name}: ${error.message}`);
    }
    
    return addedCount;
  }

  async generateEventsForCity(cityConfig, bbox, allowGenerated = false) {
    const events = [];

    // Проверяем, есть ли РЕАЛЬНЫЕ события в статической базе
    const uniqueEvents = getUniqueEventsForCity(cityConfig.name);
    
    // Инициализируем массив событий
    let eventsToProcess = [];
    
    // Если есть реальные события - используем их
    if (uniqueEvents && uniqueEvents.length > 0) {
      logger.info(`✨ Найдено ${uniqueEvents.length} реальных уникальных событий для ${cityConfig.name}`);
      eventsToProcess = uniqueEvents;
    } else if (allowGenerated) {
      // Если нет реальных событий, но разрешена генерация - генерируем события по шаблонам
      logger.info(`📝 Генерируем события для ${cityConfig.name} по шаблонам (нет уникальных событий в базе)`);
      
      // Генерируем события для всех категорий
      const eventsToGenerate = Math.min(this.eventsPerCity, this.eventCategories.length);
      
      for (let i = 0; i < eventsToGenerate; i++) {
        const category = this.eventCategories[i % this.eventCategories.length];
        const title = this.generateEventTitle(cityConfig.name, category);
        const description = this.generateDetailedDescription(cityConfig.name, category);
        const hashtags = this.generateHashtags(cityConfig.name, category);
        
        eventsToProcess.push({
          title,
          description,
          category: category.name,
          hashtags
        });
      }
    } else {
      // Если нет реальных событий и генерация запрещена - пропускаем
      logger.info(`⏭️  Пропускаем ${cityConfig.name} - нет реальных уникальных событий в базе`);
      return events;
    }
    
    // Генерируем уникальные даты для каждого события
    const usedDates = new Set(); // Для отслеживания использованных дат
    
    const generateUniqueDate = () => {
      const now = new Date();
      const future = new Date(now.getTime() + (180 * 24 * 60 * 60 * 1000)); // +6 месяцев
      
      let attempts = 0;
      let date;
      
      // Генерируем уникальную дату (не повторяющуюся)
      do {
      const randomTime = now.getTime() + Math.random() * (future.getTime() - now.getTime());
        date = new Date(randomTime);
        
        // Делаем дату более реалистичной - предпочитаем выходные дни (суббота, воскресенье)
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          // Если будний день, с вероятностью 60% переносим на ближайшую субботу
          if (Math.random() < 0.6) {
            const daysToSaturday = (6 - dayOfWeek + 7) % 7 || 7;
            date.setDate(date.getDate() + daysToSaturday);
          }
        }
        
        // Устанавливаем реалистичное время начала события (10:00 - 18:00)
        const startHour = 10 + Math.floor(Math.random() * 8); // 10-17 часов
        const startMinute = Math.random() < 0.5 ? 0 : 30; // 0 или 30 минут
        date.setHours(startHour, startMinute, 0, 0);
        
        // Проверяем уникальность по дню (без учета времени)
        const dateKey = date.toISOString().split('T')[0]; // Только дата без времени
        
        attempts++;
        if (attempts > 100) {
          // Если не можем найти уникальную дату за 100 попыток, используем эту
          break;
        }
        
        if (!usedDates.has(dateKey)) {
          usedDates.add(dateKey);
          break;
        }
      } while (usedDates.has(date.toISOString().split('T')[0]));
      
      return date;
    };
    
    // Обрабатываем все события (уникальные или сгенерированные)
    for (const uniqueEvent of eventsToProcess) {
      // Проверяем, есть ли фиксированная дата в событии
      let eventDate;
      let endDate;
      
      if (uniqueEvent.start_datetime) {
        // Используем фиксированную дату из события
        eventDate = new Date(uniqueEvent.start_datetime);
        if (uniqueEvent.end_datetime) {
          endDate = new Date(uniqueEvent.end_datetime);
        } else {
          // Если нет end_datetime, генерируем длительность
          const durationHours = uniqueEvent.duration_hours || (2 + Math.floor(Math.random() * 5));
          endDate = new Date(eventDate.getTime() + (durationHours * 60 * 60 * 1000));
        }
      } else {
        // Генерируем уникальную дату
        eventDate = generateUniqueDate();
        const durationHours = uniqueEvent.duration_hours || (2 + Math.floor(Math.random() * 5));
        endDate = new Date(eventDate.getTime() + (durationHours * 60 * 60 * 1000));
      }
      
      // Определяем локацию (может быть указана в событии или использовать город)
      const location = uniqueEvent.location || `${cityConfig.name}, ${cityConfig.subject}`;
      
      // Геокодируем адрес для получения координат
      let latitude = null;
      let longitude = null;
      
      // Если координаты указаны в событии, используем их
      if (uniqueEvent.latitude !== undefined && uniqueEvent.longitude !== undefined) {
        latitude = uniqueEvent.latitude;
        longitude = uniqueEvent.longitude;
        logger.info(`📍 Используем координаты из события: [${latitude}, ${longitude}]`);
      } else {
        // Иначе геокодируем адрес
        // КРИТИЧНО: Добавляем задержку между запросами, чтобы не превысить лимиты API
        try {
          // Задержка 500мс между запросами для защиты от превышения лимитов
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const geocoded = await geocodeAddress(location);
          if (geocoded) {
            latitude = geocoded.latitude;
            longitude = geocoded.longitude;
            logger.info(`📍 Геокодирование для "${location}": [${latitude}, ${longitude}]`);
          } else {
            logger.warn(`⚠️ Не удалось геокодировать адрес "${location}"`);
          }
        } catch (error) {
          logger.warn(`⚠️ Ошибка геокодирования для "${location}": ${error.message}`);
        }
      }
      
      const event = {
        title: uniqueEvent.title,
        description: uniqueEvent.description,
        start_datetime: eventDate.toISOString(),
        end_datetime: endDate.toISOString(),
        location: location,
        category: uniqueEvent.category,
        event_type: this.getEventType(uniqueEvent.category), // Используем маппинг для получения допустимого значения
        is_public: true,
        creator_id: 'c839a4bb-c268-458f-b3cd-b301e3656bc5', // Системный пользователь
        hashtags: uniqueEvent.hashtags || this.generateHashtags(cityConfig.name, { name: uniqueEvent.category }),
        latitude: latitude,
        longitude: longitude
      };
      
      events.push(event);
    }
    
    return events;
  }

  generateEventTitle(cityName, category) {
    const templates = {
      'Фестиваль': [
        `Культурный фестиваль в ${cityName}`,
        `Фестиваль искусств "${cityName}"`,
        `Праздник города ${cityName}`,
        `Традиционный фестиваль ${cityName}`,
        `Международный фестиваль в ${cityName}`
      ],
      'Концерт': [
        `Музыкальный концерт в ${cityName}`,
        `Концерт под открытым небом в ${cityName}`,
        `Выступление артистов в ${cityName}`,
        `Музыкальный вечер в ${cityName}`,
        `Концертная программа в ${cityName}`
      ],
      'Выставка': [
        `Художественная выставка в ${cityName}`,
        `Историческая экспозиция "${cityName}"`,
        `Музейная выставка в ${cityName}`,
        `Выставка ремесел в ${cityName}`,
        `Арт-выставка в ${cityName}`
      ],
      'Спортивное событие': [
        `Спортивный турнир в ${cityName}`,
        `Соревнования в ${cityName}`,
        `Спортивный праздник в ${cityName}`,
        `Фестиваль спорта "${cityName}"`,
        `Спортивное мероприятие в ${cityName}`
      ],
      'Ярмарка': [
        `Торговая ярмарка в ${cityName}`,
        `Ремесленная ярмарка "${cityName}"`,
        `Праздник торговли в ${cityName}`,
        `Ярмарка товаров в ${cityName}`,
        `Городская ярмарка в ${cityName}`
      ]
    };
    
    const categoryTemplates = templates[category.name] || templates['Фестиваль'];
    return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
  }

  generateDetailedDescription(cityName, category) {
    const descriptions = {
      'Фестиваль': [
        `Культурный фестиваль в ${cityName} с участием местных и приглашенных артистов. Программа включает концерты, мастер-классы и выставки.`,
        `Фестиваль искусств в ${cityName} представляет лучшие образцы современного и традиционного творчества.`,
        `Праздник города ${cityName} - масштабное культурное мероприятие с развлекательной программой для всей семьи.`,
        `Традиционный фестиваль в ${cityName} знакомит с культурным наследием региона и современными интерпретациями.`
      ],
      'Концерт': [
        `Музыкальный концерт в ${cityName} с участием известных исполнителей. Программа включает разнообразные музыкальные жанры.`,
        `Концерт под открытым небом в ${cityName} - незабываемое музыкальное событие в живописной обстановке.`,
        `Выступление артистов в ${cityName} представляет лучшие образцы музыкального искусства.`,
        `Музыкальный вечер в ${cityName} с программой классической и современной музыки.`
      ],
      'Выставка': [
        `Художественная выставка в ${cityName} демонстрирует работы местных и приглашенных художников.`,
        `Историческая экспозиция в ${cityName} рассказывает о богатом прошлом региона и его культурном наследии.`,
        `Музейная выставка в ${cityName} представляет уникальные экспонаты и артефакты.`,
        `Выставка ремесел в ${cityName} знакомит с традиционными и современными техниками мастерства.`
      ],
      'Спортивное событие': [
        `Спортивный турнир в ${cityName} собирает лучших спортсменов региона для соревнований.`,
        `Соревнования в ${cityName} включают различные спортивные дисциплины и категории участников.`,
        `Спортивный праздник в ${cityName} - масштабное мероприятие с участием спортсменов и болельщиков.`,
        `Фестиваль спорта в ${cityName} объединяет любителей активного образа жизни и профессиональных спортсменов.`
      ],
      'Ярмарка': [
        `Торговая ярмарка в ${cityName} предлагает широкий ассортимент товаров от местных производителей.`,
        `Ремесленная ярмарка в ${cityName} представляет уникальные изделия ручной работы мастеров региона.`,
        `Праздник торговли в ${cityName} - яркое событие с торговыми рядами, развлечениями и угощениями.`,
        `Городская ярмарка в ${cityName} объединяет торговцев, ремесленников и всех любителей ярмарочной атмосферы.`
      ]
    };
    
    const categoryDescriptions = descriptions[category.name] || descriptions['Фестиваль'];
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
  }

  generateHashtags(cityName, category) {
    const baseHashtags = [cityName.toLowerCase().replace(/\s+/g, ''), 'события'];
    const categoryHashtags = {
      'Фестиваль': ['фестиваль', 'культура'],
      'Концерт': ['концерт', 'музыка'],
      'Выставка': ['выставка', 'искусство'],
      'Спортивное событие': ['спорт', 'соревнования'],
      'Ярмарка': ['ярмарка', 'торговля']
    };
    
    const categoryTags = categoryHashtags[category.name] || ['мероприятие'];
    return [...baseHashtags, ...categoryTags];
  }
}

module.exports = new EventParser();
