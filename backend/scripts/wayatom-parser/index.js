#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

const citiesConfig = require('./config/cities');
const { fetchCityBBox } = require('./utils/geocoder');
const cityParser = require('./parsers/cityParser');
const databaseService = require('./services/databaseService');
const logger = require('./utils/logger');

class WayAtomParser {
  constructor() {
    this.progressFile = path.join(__dirname, 'progress', 'cities-progress.json');
  }

  async start() {
    console.log(chalk.blue.bold('🏙️ Парсер маркеров WayAtom'));
    console.log(chalk.gray('Парсинг городов России по алфавиту'));

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
      { name: '🏙️  Парсить город', value: 'parse_city' },
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
      case 'parse_city':
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
        console.log(chalk.green('👋 До свидания!'));
        process.exit(0);
        break;
    }
  }

  // Разворачиваем региональную структуру в плоский список
  flattenCities(config) {
    const items = [];
    const regions = config.regions || {};
    Object.values(regions).forEach(region => {
      const subjects = region.subjects || {};
      Object.values(subjects).forEach(subject => {
        const cities = subject.cities || [];
        cities.forEach(c => {
          items.push({ key: c.key, name: c.name, priority: c.priority || 3, subject: subject.name });
        });
      });
    });
    return items;
  }

  async selectCityToParse() {
    const progress = await this.loadProgress();
    
    // Сначала выбираем регион
    const regions = Object.values(citiesConfig.regions || {});
    const regionChoices = regions.map(region => ({
      name: region.name,
      value: region.name
    }));

    const { selectedRegion } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedRegion',
        message: 'Выберите регион:',
        choices: [
          ...regionChoices,
          { name: '⬅️  Назад в главное меню', value: 'back' }
        ]
      }
    ]);

    if (selectedRegion === 'back') {
      await this.showMainMenu();
      return;
    }

    // Находим выбранный регион и его субъекты
    const region = regions.find(r => r.name === selectedRegion);
    if (!region || !region.subjects) {
      console.log(chalk.red('❌ Регион не найден'));
      await this.showMainMenu();
      return;
    }

    // Выбираем субъект
    const subjects = Object.values(region.subjects);
    const subjectChoices = subjects.map(subject => ({
      name: `${subject.name} (${subject.cities.length} городов)`,
      value: subject.name
    }));

    const { selectedSubject } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedSubject',
        message: 'Выберите субъект:',
        choices: [
          ...subjectChoices,
          { name: '⬅️  Назад к выбору региона', value: 'back' }
        ]
      }
    ]);

    if (selectedSubject === 'back') {
      await this.selectCityToParse();
      return;
    }

    // Находим выбранный субъект
    const subject = subjects.find(s => s.name === selectedSubject);
    if (!subject || !subject.cities || subject.cities.length === 0) {
      console.log(chalk.red('❌ Субъект не найден или нет городов'));
      await this.selectCityToParse();
      return;
    }

    // Выбираем город из субъекта
    const availableCities = subject.cities.filter(c => !progress.completed.includes(c.key));
    const cityChoices = availableCities.map(city => ({
        name: `${city.name} (приоритет: ${city.priority})`,
      value: city.key
    }));

    if (cityChoices.length === 0) {
      console.log(chalk.yellow('⚠️ Все города этого субъекта уже обработаны'));
      await this.selectCityToParse();
      return;
    }

    const { cityKey } = await inquirer.prompt([
      {
        type: 'list',
        name: 'cityKey',
        message: 'Выберите город для парсинга:',
        choices: [
          ...cityChoices,
          { name: '⬅️  Назад к выбору субъекта', value: 'back' }
        ]
      }
    ]);

    if (cityKey === 'back') {
      await this.selectCityToParse();
      return;
    }

    await this.parseCity(cityKey);
  }

  async parseCity(cityKey) {
    const flat = this.flattenCities(citiesConfig);
    const cityConfig = flat.find(c => c.key === cityKey);
    
    console.log(chalk.blue(`🏙️ Начинаем парсинг города: ${cityConfig.name}`));
    
    const startTime = Date.now();
    
    try {
      // Обновляем прогресс
      const progress = await this.loadProgress();
      progress.in_progress = cityKey;
      await this.saveProgress(progress);

      // Получаем/кешируем bbox
      const bbox = await this.ensureBBox(progress, cityConfig);

      // Парсим город
      const addedMarkers = await cityParser.parseCity({ name: cityConfig.name, bounds: bbox });
      
      // Обновляем прогресс после завершения
      progress.completed.push(cityKey);
      progress.in_progress = null;
      progress.statistics.completed_cities = progress.completed.length;
      progress.statistics.total_markers = await databaseService.getMarkersCount();
      
      await this.saveProgress(progress);
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      
      console.log(chalk.green(`✅ Парсинг города ${cityConfig.name} завершен`));
      console.log(chalk.gray(`📊 Добавлено маркеров: ${addedMarkers}`));
      console.log(chalk.gray(`⏱️ Время выполнения: ${duration} сек`));
      
    } catch (error) {
      logger.error(`Ошибка парсинга города ${cityConfig.name}: ${error.message}`);
      
      // Сбрасываем статус "в процессе"
      const progress = await this.loadProgress();
      progress.in_progress = null;
      await this.saveProgress(progress);
    }

    console.log(chalk.gray('Нажмите Enter для продолжения...'));
    await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
    
    await this.showMainMenu();
  }

  async ensureBBox(progress, city) {
    progress.bbox = progress.bbox || {};
    if (progress.bbox[city.key]) {
      return progress.bbox[city.key];
    }
    console.log(chalk.yellow(`🔍 Определяем границы города: ${city.name}`));
    const bbox = await fetchCityBBox(`${city.name}, Россия`);
    if (!bbox) throw new Error('Не удалось определить bbox города');
    progress.bbox[city.key] = bbox;
    await this.saveProgress(progress);
    return bbox;
  }

  async showProgress() {
    const progress = await this.loadProgress();
    const totalCities = this.flattenCities(citiesConfig).length;
    
    console.log(chalk.blue.bold('📊 Прогресс парсинга'));
    console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.white(`Всего городов: ${totalCities}`));
    console.log(chalk.white(`Обработано: ${progress.completed.length}`));
    console.log(chalk.white(`Осталось: ${totalCities - progress.completed.length}`));
    
    if (progress.in_progress) {
      const flat = this.flattenCities(citiesConfig);
      const inCity = flat.find(c => c.key === progress.in_progress);
      if (inCity) console.log(chalk.yellow(`🔄 В процессе: ${inCity.name} (${inCity.subject})`));
    }
    
    if (progress.completed.length > 0) {
      console.log(chalk.green('✅ Обработанные города:'));
      const flat = this.flattenCities(citiesConfig);
      progress.completed.forEach(cityKey => {
        const c = flat.find(x => x.key === cityKey);
        if (c) console.log(chalk.gray(`  • ${c.name} (${c.subject})`));
      });
    }
    
    console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
    
    await this.showMainMenu();
  }

  async listCities() {
    console.log(chalk.blue.bold('📋 Список всех городов'));
    
    const progress = await this.loadProgress();
    const flat = this.flattenCities(citiesConfig);
    flat.forEach(city => {
      const status = progress.completed.includes(city.key) ? '✅' : '⏳';
      console.log(chalk.gray(`  ${status} ${city.name} (${city.subject})`));
    });
    
    console.log(chalk.gray('Нажмите Enter для продолжения...'));
    await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
    
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
        in_progress: null,
        statistics: {
          total_cities: this.flattenCities(citiesConfig).length,
          completed_cities: 0,
          total_markers: await databaseService.getMarkersCount()
        }
      };
      
      await this.saveProgress(defaultProgress);
      console.log(chalk.green('✅ Прогресс сброшен'));
    }
    
    await this.showMainMenu();
  }

  async loadProgress() {
    try {
      const data = await fs.readFile(this.progressFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Создаем файл прогресса, если его нет
      const defaultProgress = {
        completed: [],
        in_progress: null,
        statistics: {
          total_cities: this.flattenCities(citiesConfig).length,
          completed_cities: 0,
          total_markers: 0
        }
      };
      
      await this.saveProgress(defaultProgress);
      return defaultProgress;
    }
  }

  async saveProgress(progress) {
    try {
      await fs.writeFile(this.progressFile, JSON.stringify(progress, null, 2));
    } catch (error) {
      logger.error(`Ошибка сохранения прогресса: ${error.message}`);
    }
  }

  isCompleted(cityKey) {
    // Простая проверка без загрузки файла
    return false; // Будет обновлено при загрузке прогресса
  }
}

// Запуск парсера
if (require.main === module) {
  const parser = new WayAtomParser();
  parser.start().catch(error => {
    console.error(chalk.red('Критическая ошибка:'), error);
    process.exit(1);
  });
}

module.exports = WayAtomParser;
