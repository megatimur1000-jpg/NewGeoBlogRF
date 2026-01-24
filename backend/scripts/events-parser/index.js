#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

const citiesConfig = require('../wayatom-parser/config/cities');
const { fetchCityBBox } = require('../wayatom-parser/utils/geocoder');
const eventParser = require('./parsers/eventParser');
const databaseService = require('./services/databaseService');
const logger = require('../wayatom-parser/utils/logger');
const { getUniqueEventsForCity, getAllCitiesWithEvents } = require('./parsers/uniqueEvents');

class EventsParser {
  constructor() {
    this.progressFile = path.join(__dirname, 'progress', 'events-progress.json');
  }

  async start() {
    logger.info(chalk.blue('🚀 Запуск парсера событий...'));
    logger.info(chalk.gray('─────────────────────────────────────'));

    try {
      await this.loadProgress();
      await this.showMainMenu();
    } catch (error) {
      logger.error(`Критическая ошибка: ${error.message}`);
      process.exit(1);
    }
  }

  async showMainMenu() {
    const choices = [
      { name: '🚀 Парсить ВСЕ города с событиями (автоматически)', value: 'parse_all_cities' },
      { name: '🌍 Парсить ВСЕ города из конфигурации (включая районные центры)', value: 'parse_all_cities_config' },
      { name: '🔍 Показать все города с реальными событиями', value: 'show_cities_with_events' },
      { name: '🏙️  Парсить события для конкретного города', value: 'parse_city_events' },
      { name: '📊 Показать прогресс', value: 'show_progress' },
      { name: '📋 Список всех городов', value: 'list_cities' },
      { name: '🔄 Сбросить прогресс', value: 'reset_progress' },
      { name: '❌ Выход', value: 'exit' }
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Выберите действие:',
        choices
      }
    ]);

    switch (action) {
      case 'parse_all_cities':
        await this.parseAllCitiesWithEvents(false);
        break;
      case 'parse_all_cities_config':
        await this.parseAllCitiesWithEvents(true);
        break;
      case 'show_cities_with_events':
        await this.showCitiesWithRealEvents();
        break;
      case 'parse_city_events':
        await this.selectCityToParse();
        break;
      case 'show_progress':
        await this.showProgress();
        break;
      case 'list_cities':
        await this.listCities();
        break;
      case 'reset_progress':
        await this.resetProgress();
        break;
      case 'exit':
        logger.info(chalk.yellow('👋 До свидания!'));
        process.exit(0);
    }
  }

  async selectCityToParse() {
    const progress = await this.loadProgress();
    const flat = this.flattenCities(citiesConfig);
    
    // Фильтруем города, которые еще не обработаны И имеют реальные события
    const availableCities = flat.filter(city => {
      const hasEvents = getUniqueEventsForCity(city.name);
      return !progress.completed.includes(city.key) && hasEvents && hasEvents.length > 0;
    });
    
    if (availableCities.length === 0) {
      logger.info(chalk.yellow('⚠️  Нет городов с реальными событиями для парсинга!'));
      logger.info(chalk.gray('   Используйте опцию "Показать все города с реальными событиями" для просмотра доступных городов.'));
      await this.showMainMenu();
      return;
    }

    const choices = availableCities.map(city => {
      const events = getUniqueEventsForCity(city.name);
      const eventsCount = events ? events.length : 0;
      return {
        name: `${city.name} (${city.subject}) - ${eventsCount} реальных событий`,
        value: city.key
      };
    });

    const { cityKey } = await inquirer.prompt([
      {
        type: 'list',
        name: 'cityKey',
        message: 'Выберите город для парсинга событий:',
        choices
      }
    ]);

    const cityConfig = flat.find(city => city.key === cityKey);
    if (!cityConfig) {
      logger.error(chalk.red('❌ Город не найден!'));
      await this.showMainMenu();
      return;
    }

    await this.parseCityEvents(cityConfig);
  }

  async parseCityEvents(cityConfig) {
    logger.info(chalk.cyan(`\n🏙️  Начинаем парсинг для: ${cityConfig.name}, ${cityConfig.subject}`));
    
    try {
      // Получаем bbox для города
      let bbox = cityConfig.bounds;
      if (!bbox) {
        logger.info(chalk.gray('📍 Получаем границы города...'));
        bbox = await fetchCityBBox(cityConfig.name);
        if (!bbox) {
          logger.error(chalk.red('❌ Не удалось получить границы города!'));
          await this.showMainMenu();
          return;
        }
      }

      // Парсим события
      const eventsCount = await eventParser.parseCityEvents(cityConfig, bbox);
      
      // Обновляем прогресс
      const progress = await this.loadProgress();
      progress.completed.push(cityConfig.key);
      progress.total_events += eventsCount;
      progress.last_updated = new Date().toISOString();
      await this.saveProgress(progress);

      logger.info(chalk.green(`✅ Парсинг завершен! Добавлено событий: ${eventsCount}`));
      
    } catch (error) {
      logger.error(`Ошибка парсинга событий для ${cityConfig.name}: ${error.message}`);
    }

    await this.showMainMenu();
  }

  async showProgress() {
    const progress = await this.loadProgress();
    const flat = this.flattenCities(citiesConfig);
    
    logger.info(chalk.blue('\n📊 Прогресс парсинга:'));
    logger.info(chalk.gray('─────────────────────────────────────'));
    logger.info(chalk.white(`Всего городов: ${flat.length}`));
    logger.info(chalk.white(`Обработано: ${progress.completed.length}`));
    logger.info(chalk.white(`Всего событий: ${progress.total_events}`));
    logger.info(chalk.white(`Последнее обновление: ${new Date(progress.last_updated).toLocaleString('ru-RU')}`));
    
    if (progress.completed.length > 0) {
      logger.info(chalk.green('\n✅ Обработанные города:'));
      progress.completed.forEach(cityKey => {
        const city = flat.find(c => c.key === cityKey);
        if (city) {
          logger.info(chalk.gray(`   • ${city.name}, ${city.subject}`));
        }
      });
    }

    await this.showMainMenu();
  }

  async parseAllCitiesWithEvents(includeAllCities = false) {
    logger.info(chalk.blue('\n🚀 Начинаем автоматический парсинг городов...'));
    logger.info(chalk.gray('─────────────────────────────────────\n'));
    
    const progress = await this.loadProgress();
    const flat = this.flattenCities(citiesConfig);
    let totalAdded = 0;
    let skipped = 0;
    let citiesToProcess = [];
    
    if (includeAllCities) {
      // Парсим ВСЕ города из конфигурации, включая районные центры
      logger.info(chalk.cyan('📋 Режим: парсинг всех городов из конфигурации (включая районные центры)'));
      citiesToProcess = flat.filter(city => !progress.completed.includes(city.key));
    } else {
      // Парсим только города с уникальными событиями
      const allCitiesWithEvents = getAllCitiesWithEvents();
      
      if (allCitiesWithEvents.length === 0) {
        logger.info(chalk.yellow('⚠️  Нет городов с реальными событиями в базе'));
        await this.showMainMenu();
        return;
      }
      
      logger.info(chalk.green(`✅ Найдено ${allCitiesWithEvents.length} городов с событиями для парсинга\n`));
      
      // Преобразуем в формат cityConfig
      for (const cityData of allCitiesWithEvents) {
        // Находим город в конфигурации
        // Сначала ищем точное совпадение по названию
        let cityConfig = flat.find(c => c.name === cityData.name);
        
        // Если не нашли, ищем через getUniqueEventsForCity (для городов с разными названиями)
        if (!cityConfig) {
          cityConfig = flat.find(c => {
            const events = getUniqueEventsForCity(c.name);
            // Проверяем, что события совпадают (сравниваем по первому событию)
            if (events && events.length > 0 && cityData.events && cityData.events.length > 0) {
              return events[0]?.title === cityData.events[0]?.title;
            }
            return false;
          });
        }
        
        // Если город не найден в конфигурации, создаем минимальный конфиг на лету
        if (!cityConfig) {
          // Определяем субъект по названию города (базовая логика)
          let subject = 'Не указан';
          const subjectMap = {
            'Астрахань': 'Астраханская область',
            'Суздаль': 'Владимирская область',
            'Кострома': 'Костромская область',
            'Муром': 'Владимирская область',
            'Москва': 'Москва',
            'Санкт-Петербург': 'Санкт-Петербург',
            'Казань': 'Республика Татарстан',
            'Нижний Новгород': 'Нижегородская область',
            'Екатеринбург': 'Свердловская область',
            'Новосибирск': 'Новосибирская область',
            'Ростов-на-Дону': 'Ростовская область',
            'Краснодар': 'Краснодарский край',
            'Сочи': 'Краснодарский край',
            'Ярославль': 'Ярославская область',
            'Владимир': 'Владимирская область',
            'Волгоград': 'Волгоградская область',
            'Воронеж': 'Воронежская область',
            'Пермь': 'Пермский край',
            'Уфа': 'Республика Башкортостан',
            'Челябинск': 'Челябинская область',
            'Магнитогорск': 'Челябинская область',
            'Омск': 'Омская область',
            'Тюмень': 'Тюменская область',
            'Самара': 'Самарская область',
            'Саратов': 'Саратовская область',
            'Иркутск': 'Иркутская область',
            'Красноярск': 'Красноярский край',
            'Хабаровск': 'Хабаровский край',
            'Барнаул': 'Алтайский край',
            'Калининград': 'Калининградская область'
          };
          
          subject = subjectMap[cityData.name] || 'Не указан';
          
          // Создаем минимальный конфиг
          cityConfig = {
            key: cityData.name.toLowerCase().replace(/\s+/g, '_'),
            name: cityData.name,
            subject: subject,
            priority: 3,
            bounds: null
          };
          
          logger.info(chalk.yellow(`⚠️  Город "${cityData.name}" не найден в конфигурации, создаем временный конфиг`));
        }
        
        citiesToProcess.push(cityConfig);
      }
    }
    
    // Обрабатываем все города
    for (const cityConfig of citiesToProcess) {
      // Проверяем, не обработан ли уже
      if (progress.completed.includes(cityConfig.key)) {
        logger.info(chalk.gray(`⏭️  ${cityConfig.name} уже обработан, пропускаем`));
        skipped++;
        continue;
      }
      
      try {
        logger.info(chalk.cyan(`\n🏙️  Обрабатываем: ${cityConfig.name}, ${cityConfig.subject}`));
        // Если includeAllCities = true, разрешаем генерацию событий для городов без уникальных событий
        const addedCount = await eventParser.parseCityEvents(cityConfig, cityConfig.bounds, includeAllCities);
        totalAdded += addedCount;
        
        if (addedCount > 0) {
          // Обновляем прогресс
          progress.completed.push(cityConfig.key);
          progress.total_events += addedCount;
          progress.last_updated = new Date().toISOString();
          await this.saveProgress(progress);
        }
      } catch (error) {
        logger.error(chalk.red(`❌ Ошибка при обработке ${cityConfig.name}: ${error.message}`));
      }
    }
    
    logger.info(chalk.green(`\n✅ Автоматический парсинг завершен!`));
    logger.info(chalk.white(`   Обработано городов: ${citiesToProcess.length - skipped}`));
    logger.info(chalk.white(`   Добавлено событий: ${totalAdded}`));
    logger.info(chalk.white(`   Пропущено: ${skipped}`));
    
    await this.showMainMenu();
  }

  async showCitiesWithRealEvents() {
    // Получаем все города с событиями напрямую из базы
    const allCitiesWithEvents = getAllCitiesWithEvents();
    const flat = this.flattenCities(citiesConfig);
    
    logger.info(chalk.blue('\n🔍 Города с реальными уникальными событиями:'));
    logger.info(chalk.gray('─────────────────────────────────────'));
    
    if (allCitiesWithEvents.length === 0) {
      logger.info(chalk.yellow('⚠️  Нет городов с реальными событиями в базе'));
    } else {
      let totalEvents = 0;
      const citiesWithInfo = [];
      
      allCitiesWithEvents.forEach(cityData => {
        // Находим субъект для города
        const cityInConfig = flat.find(c => {
          const events = getUniqueEventsForCity(c.name);
          return events && events.length > 0 && cityData.name === c.name;
        });
        
        const subject = cityInConfig ? cityInConfig.subject : 'Не указан';
        totalEvents += cityData.events.length;
        
        citiesWithInfo.push({
          name: cityData.name,
          subject: subject,
          events: cityData.events
        });
      });
      
      logger.info(chalk.green(`\n✅ Найдено ${citiesWithInfo.length} городов с ${totalEvents} реальными событиями:\n`));
      
      citiesWithInfo.forEach(city => {
        logger.info(chalk.cyan(`📍 ${city.name}, ${city.subject} - ${city.events.length} событий:`));
        city.events.forEach(event => {
          logger.info(chalk.white(`   • ${event.title} (${event.category})`));
        });
        logger.info('');
      });
    }

    await this.showMainMenu();
  }

  async listCities() {
    const progress = await this.loadProgress();
    const flat = this.flattenCities(citiesConfig);
    
    logger.info(chalk.blue('\n📋 Список всех городов:'));
    logger.info(chalk.gray('─────────────────────────────────────'));
    
    flat.forEach(city => {
      const status = progress.completed.includes(city.key) ? '✅' : '⏳';
      const hasEvents = getUniqueEventsForCity(city.name) ? '✨' : '';
      logger.info(chalk.white(`${status} ${hasEvents} ${city.name}, ${city.subject} (приоритет: ${city.priority})`));
    });

    await this.showMainMenu();
  }

  async resetProgress() {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Вы уверены, что хотите сбросить весь прогресс?',
        default: false
      }
    ]);

    if (confirm) {
      const defaultProgress = {
        completed: [],
        total_events: 0,
        last_updated: new Date().toISOString(),
        total_cities: this.flattenCities(citiesConfig).length
      };
      
      await this.saveProgress(defaultProgress);
      logger.info(chalk.green('✅ Прогресс сброшен!'));
    }

    await this.showMainMenu();
  }

  flattenCities(citiesConfig) {
    const flat = [];
    
    Object.values(citiesConfig.regions).forEach(region => {
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
    
    // Сортируем по алфавиту по названию города
    return flat.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }

  async loadProgress() {
    try {
      await fs.mkdir(path.dirname(this.progressFile), { recursive: true });
      const data = await fs.readFile(this.progressFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      const defaultProgress = {
        completed: [],
        total_events: 0,
        last_updated: new Date().toISOString(),
        total_cities: this.flattenCities(citiesConfig).length
      };
      await this.saveProgress(defaultProgress);
      return defaultProgress;
    }
  }

  async saveProgress(progress) {
    await fs.mkdir(path.dirname(this.progressFile), { recursive: true });
    await fs.writeFile(this.progressFile, JSON.stringify(progress, null, 2));
  }
}

// Запуск парсера
if (require.main === module) {
  const parser = new EventsParser();
  parser.start().catch(error => {
    logger.error(chalk.red('💥 Критическая ошибка:'), error);
    process.exit(1);
  });
}

module.exports = EventsParser;

