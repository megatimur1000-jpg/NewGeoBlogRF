#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

const internationalCitiesConfig = require('./config/international-cities');
const { fetchCityBBox } = require('./utils/geocoder');
const cityParser = require('./parsers/cityParser');
const databaseService = require('./services/databaseService');
const logger = require('./utils/logger');

class InternationalParser {
  constructor() {
    this.progressFile = path.join(__dirname, 'progress', 'international-progress.json');
  }

  async start() {
    console.log(chalk.blue.bold('🌍 Международный парсер маркеров'));
    console.log(chalk.gray('Парсинг популярных направлений для россиян'));

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
      { name: '🌍 Парсить страну', value: 'parse_country' },
      { name: '🏙️ Парсить город', value: 'parse_city' },
      { name: '📊 Показать прогресс', value: 'show_progress' },
      { name: '📋 Список всех стран', value: 'list_countries' },
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
      case 'parse_country':
        await this.selectCountryToParse();
        break;
      case 'parse_city':
        await this.selectCityToParse();
        break;
      case 'show_progress':
        await this.showProgress();
        break;
      case 'list_countries':
        await this.listCountries();
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

  async selectCountryToParse() {
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:     const progress = await this.loadProgress();
    
    const countries = Object.values(internationalCitiesConfig.countries);
    const countryChoices = countries.map(country => ({
      name: `${country.name} (${country.cities.length} городов)`,
      value: country.name
    }));

    const { selectedCountry } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedCountry',
        message: 'Выберите страну для парсинга:',
        choices: [
          ...countryChoices,
          { name: '⬅️ Назад в главное меню', value: 'back' }
        ]
      }
    ]);

    if (selectedCountry === 'back') {
      await this.showMainMenu();
      return;
    }

    const country = countries.find(c => c.name === selectedCountry);
    if (!country || !country.cities || country.cities.length === 0) {
      console.log(chalk.red('❌ Страна не найдена или нет городов'));
      await this.showMainMenu();
      return;
    }

    // Парсим все города страны
    console.log(chalk.blue(`🌍 Начинаем парсинг страны: ${country.name}`));
    
    let totalAdded = 0;
    for (const city of country.cities) {
      try {
        const added = await this.parseCity(city, country.name);
        totalAdded += added;
      } catch (error) {
        logger.error(`Ошибка парсинга города ${city.name}: ${error.message}`);
      }
    }

    console.log(chalk.green(`✅ Парсинг страны ${country.name} завершен. Добавлено: ${totalAdded} маркеров`));
    
    await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Нажмите Enter для продолжения...' }]);
    await this.showMainMenu();
  }

  async selectCityToParse() {
    const progress = await this.loadProgress();
    
    // Сначала выбираем страну
    const countries = Object.values(internationalCitiesConfig.countries);
    const countryChoices = countries.map(country => ({
      name: country.name,
      value: country.name
    }));

    const { selectedCountry } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedCountry',
        message: 'Выберите страну:',
        choices: [
          ...countryChoices,
          { name: '⬅️ Назад в главное меню', value: 'back' }
        ]
      }
    ]);

    if (selectedCountry === 'back') {
      await this.showMainMenu();
      return;
    }

    // Находим выбранную страну
    const country = countries.find(c => c.name === selectedCountry);
    if (!country || !country.cities) {
      console.log(chalk.red('❌ Страна не найдена'));
      await this.showMainMenu();
      return;
    }

    // Выбираем город
    const availableCities = country.cities.filter(c => !progress.completed.includes(c.key));
    const cityChoices = availableCities.map(city => ({
      name: `${city.name} (приоритет: ${city.priority})`,
      value: city.key
    }));

    if (cityChoices.length === 0) {
      console.log(chalk.yellow('⚠️ Все города этой страны уже обработаны'));
      await this.showMainMenu();
      return;
    }

    const { cityKey } = await inquirer.prompt([
      {
        type: 'list',
        name: 'cityKey',
        message: 'Выберите город для парсинга:',
        choices: [
          ...cityChoices,
          { name: '⬅️ Назад к выбору страны', value: 'back' }
        ]
      }
    ]);

    if (cityKey === 'back') {
      await this.selectCityToParse();
      return;
    }

    const city = country.cities.find(c => c.key === cityKey);
    await this.parseCity(city, country.name);
  }

  async parseCity(cityConfig, countryName) {
    console.log(chalk.blue(`🏙️ Начинаем парсинг города: ${cityConfig.name}, ${countryName}`));
    
    const startTime = Date.now();
    
    try {
      // Обновляем прогресс
      const progress = await this.loadProgress();
      progress.in_progress = cityConfig.key;
      await this.saveProgress(progress);

      // Получаем/кешируем bbox
      const bbox = await this.ensureBBox(progress, cityConfig, countryName);

      // Парсим город
      const addedMarkers = await cityParser.parseCity({ 
        name: cityConfig.name, 
        bounds: bbox,
        country: countryName 
      });
      
      // Обновляем прогресс после завершения
      progress.completed.push(cityConfig.key);
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

  async ensureBBox(progress, city, countryName) {
    progress.bbox = progress.bbox || {};
    if (progress.bbox[city.key]) {
      return progress.bbox[city.key];
    }
    
    console.log(chalk.yellow(`🔍 Определяем границы города: ${city.name}, ${countryName}`));
    const bbox = await fetchCityBBox(`${city.name}, ${countryName}`);
    if (!bbox) throw new Error('Не удалось определить bbox города');
    progress.bbox[city.key] = bbox;
    await this.saveProgress(progress);
    return bbox;
  }

  async showProgress() {
    const progress = await this.loadProgress();
    const totalCities = this.getAllCities().length;
    
    console.log(chalk.blue.bold('📊 Прогресс парсинга'));
    console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.white(`Всего городов: ${totalCities}`));
    console.log(chalk.white(`Обработано: ${progress.completed.length}`));
    console.log(chalk.white(`Осталось: ${totalCities - progress.completed.length}`));
    
    if (progress.in_progress) {
      const inCity = this.findCityByKey(progress.in_progress);
      if (inCity) console.log(chalk.yellow(`🔄 В процессе: ${inCity.name}, ${inCity.country}`));
    }
    
    if (progress.completed.length > 0) {
      console.log(chalk.green('✅ Обработанные города:'));
      progress.completed.forEach(cityKey => {
        const city = this.findCityByKey(cityKey);
        if (city) console.log(chalk.gray(`  • ${city.name}, ${city.country}`));
      });
    }
    
    console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Нажмите Enter для продолжения...' }]);
    
    await this.showMainMenu();
  }

  async listCountries() {
    console.log(chalk.blue.bold('📋 Список всех стран'));
    console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    
    const progress = await this.loadProgress();
    const countries = Object.values(internationalCitiesConfig.countries);
    
    countries.forEach(country => {
      console.log(chalk.white.bold(`\n${country.name}:`));
      country.cities.forEach(city => {
        const status = progress.completed.includes(city.key) ? '✅' : '⏳';
        console.log(chalk.gray(`  ${status} ${city.name} (приоритет: ${city.priority})`));
      });
    });
    
    console.log(chalk.gray('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Нажмите Enter для продолжения...' }]);
    
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
          total_cities: this.getAllCities().length,
          completed_cities: 0,
          total_markers: await databaseService.getMarkersCount()
        }
      };
      
      await this.saveProgress(defaultProgress);
      console.log(chalk.green('✅ Прогресс сброшен'));
    }
    
    await this.showMainMenu();
  }

  getAllCities() {
    const cities = [];
    const countries = Object.values(internationalCitiesConfig.countries);
    countries.forEach(country => {
      country.cities.forEach(city => {
        cities.push({ ...city, country: country.name });
      });
    });
    return cities;
  }

  findCityByKey(key) {
    const cities = this.getAllCities();
    return cities.find(city => city.key === key);
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
          total_cities: this.getAllCities().length,
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
}

// Запуск парсера
if (require.main === module) {
  const parser = new InternationalParser();
  parser.start().catch(error => {
    console.error(chalk.red('Критическая ошибка:'), error);
    process.exit(1);
  });
}

module.exports = InternationalParser;



