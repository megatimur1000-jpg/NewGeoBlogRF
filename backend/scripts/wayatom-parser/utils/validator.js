class Validator {
  static isValidCoordinate(lat, lon) {
    return (
      typeof lat === 'number' && 
      typeof lon === 'number' &&
      lat >= -90 && lat <= 90 &&
      lon >= -180 && lon <= 180
    );
  }

  static isValidTitle(title) {
    if (typeof title !== 'string') return false;
    
    const trimmed = title.trim();
    
    // Проверяем базовые условия
    if (trimmed.length === 0) return false;
    if (trimmed.length < 3) return false;
    
    // Отклоняем названия только из цифр
    if (/^\d+$/.test(trimmed)) return false;
    
    // Отклоняем названия только из символов (без букв)
    if (!/[а-яёa-z]/i.test(trimmed)) return false;
    
    // Отклоняем общие названия без конкретики (только если название состоит ТОЛЬКО из этих слов)
    const genericNames = [
      'магазин', 'кафе', 'ресторан', 'отель', 'парк', 'сквер', 'площадь',
      'улица', 'дом', 'здание', 'сооружение', 'объект', 'место', 'точка',
      'shop', 'cafe', 'restaurant', 'hotel', 'park', 'square', 'street',
      'building', 'structure', 'object', 'place', 'point', 'unnamed',
      'без названия', 'неизвестно', 'неизвестное место', 'название отсутствует',
      'безымянный', 'неопознанный', 'неопределенный'
    ];
    
    const lowerName = trimmed.toLowerCase();
    
    // Отклоняем только если название состоит ТОЛЬКО из одного из этих слов
    if (genericNames.includes(lowerName)) {
      return false;
    }
    
    // Отклоняем если название начинается и заканчивается кавычками и содержит только общие слова
    if (lowerName.startsWith('"') && lowerName.endsWith('"')) {
      const withoutQuotes = lowerName.slice(1, -1).trim();
      if (genericNames.includes(withoutQuotes)) {
        return false;
      }
    }
    
    // Отклоняем названия с неполной информацией
    if (lowerName.includes('???') || lowerName.includes('...') || 
        lowerName.includes('неизвестно') || lowerName.includes('без названия') ||
        lowerName.includes('название отсутствует') || lowerName.includes('unnamed') ||
        lowerName.includes('безымянный') || lowerName.includes('неопознанный')) {
      return false;
    }
    
    return true;
  }

  static sanitizeTitle(title) {
    if (!title || typeof title !== 'string') return '';
    
    const sanitized = title.trim().replace(/\s+/g, ' ');
    
    // Дополнительная проверка после санитизации
    if (sanitized.length < 3) return '';
    if (!/[а-яёa-z]/i.test(sanitized)) return '';
    
    return sanitized;
  }

  static generateHashtags(title, category, cityName) {
    const hashtags = [];
    
    // Добавляем город
    hashtags.push(cityName.toLowerCase().replace(/\s+/g, ''));
    
    // Добавляем категорию
    hashtags.push(category.toLowerCase());
    
    // Добавляем ключевые слова из названия
    const words = title.toLowerCase().split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 2);
    
    hashtags.push(...words);
    
    return [...new Set(hashtags)]; // Убираем дубликаты
  }
}

module.exports = Validator;