const axios = require('axios');
const logger = require('../utils/logger');

class WikipediaService {
  constructor() {
    this.baseUrl = 'https://ru.wikipedia.org/api/rest_v1';
    this.searchUrl = 'https://ru.wikipedia.org/w/api.php';
  }

  async getDescription(title, cityName) {
    try {
      // Сначала ищем статью
      const searchResults = await this.searchArticle(title, cityName);
      
      if (!searchResults || searchResults.length === 0) {
        return this.generateFallbackDescription(title);
      }

      // Получаем краткое описание
      const pageTitle = searchResults[0];
      const summary = await this.getPageSummary(pageTitle);

      if (!summary) {
        return this.generateFallbackDescription(title);
      }

      // Фильтр нерелевантных описаний (биографии и прочее)
      if (this.isBiography(summary, pageTitle)) {
        return this.generateFallbackDescription(title);
      }

      // Пропускаем слишком общие/нерелевантные статьи
      if (!this.looksLikePlace(summary, pageTitle)) {
        return this.generateFallbackDescription(title);
      }

      return summary;
    } catch (error) {
      logger.warn(`Не удалось получить описание для "${title}": ${error.message}`);
      return this.generateFallbackDescription(title);
    }
  }

  async searchArticle(title, cityName) {
    try {
      const searchQueries = [
        `${title} ${cityName}`,
        title,
        `${title} достопримечательность`,
        `${title} музей`,
        `${title} ресторан`
      ];

      for (const query of searchQueries) {
        const response = await axios.get(this.searchUrl, {
          params: {
            action: 'query',
            format: 'json',
            list: 'search',
            srsearch: query,
            srlimit: 3
          },
          timeout: 10000
        });

        const results = response.data.query?.search || [];
        if (results.length > 0) {
          return results.map(r => r.title);
        }
      }

      return [];
    } catch (error) {
      logger.warn(`Ошибка поиска в Wikipedia: ${error.message}`);
      return [];
    }
  }

  async getPageSummary(pageTitle) {
    try {
      const response = await axios.get(`${this.baseUrl}/page/summary/${encodeURIComponent(pageTitle)}`, {
        timeout: 10000
      });

      const extract = response.data.extract;
      
      if (extract && extract.length > 50) {
        // Обрезаем до разумной длины
        return extract.length > 300 ? extract.substring(0, 297) + '...' : extract;
      }

      return null;
    } catch (error) {
      logger.warn(`Ошибка получения описания страницы: ${error.message}`);
      return null;
    }
  }

  generateFallbackDescription(title) {
    const templates = [
      `${title} - интересное место, которое стоит посетить.`,
      `${title} - одно из примечательных мест в городе.`,
      `${title} - место с богатой историей и культурным значением.`,
      `${title} - популярное место среди жителей и туристов.`,
      `${title} - заслуживает внимания при посещении города.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Черный список слов/паттернов для биографий и персоналий
  isBiography(text, title = '') {
    const bioPatterns = [
      /политик/i,
      /президент/i,
      /родилс[я|ась]/i,
      /умер/i,
      /певец|певица|композитор|продюсер|режиссёр|актёр|актриса/i,
      /бизнесмен|олигарх|государственный\s+деятель/i,
      /российский\s+государственный/i,
      /советский\s+и\s+российский/i
    ];
    const titleLooksLikePerson = /\s[A-ЯЁ][а-яё]+\s[A-ЯЁ][а-яё]+/.test(title);
    return titleLooksLikePerson || bioPatterns.some((re) => re.test(text));
  }

  // Белый список для «мест»: музеи, парки, памятники, здания и т.п.
  looksLikePlace(text, title = '') {
    const placePatterns = [
      /музей|усадьба|теат(р|ры)|парк|сквер|памятник|монумент|мост|набережная/i,
      /собор|церковь|храм|колокольня|крепость|кремль/i,
      /дворец|башня|здание|дом|комплекс|галерея|библиотека/i,
      /смотровая|выставочн|культурн|историческ/i
    ];
    const titleHasPlaceHint = /(музей|парк|сквер|дом|усадьба|памятник|мост|собор|храм)/i.test(title);
    return titleHasPlaceHint || placePatterns.some((re) => re.test(text));
  }

  // Общие шаблонные фразы, по которым распознаём «пустое» описание
  isGenericDescription(text = '') {
    if (!text) return true;
    const patterns = [
      /интересное место/i,
      /примечательных мест/i,
      /богатой историей/i,
      /популярное место/i,
      /заслуживает внимания/i
    ];
    return patterns.some((re) => re.test(text)) || text.trim().length < 40;
  }
}

module.exports = new WikipediaService();