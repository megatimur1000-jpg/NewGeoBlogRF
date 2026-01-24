/**
 * Система оценки полноты заполнения меток
 * Анализирует заполненность обязательных полей и рассчитывает completeness_score
 */

// Конфигурация обязательных полей для разных категорий меток
const REQUIRED_FIELDS = [
  {
    field: 'title',
    weight: 15,
    check: (marker) => marker.title && marker.title.trim().length >= 5,
    message: 'Добавьте более описательное название (минимум 5 символов)',
    priority: 'high'
  },
  {
    field: 'description', 
    weight: 20,
    check: (marker) => marker.description && marker.description.trim().length >= 50,
    message: 'Расскажите подробнее об этом месте (минимум 50 символов)',
    priority: 'high'
  },
  {
    field: 'category',
    weight: 10,
    check: (marker) => marker.category && marker.category !== 'other' && marker.category.trim().length > 0,
    message: 'Выберите подходящую категорию',
    priority: 'medium'
  },
  {
    field: 'photo_urls',
    weight: 15,
    check: (marker) => {
      if (!marker.photo_urls) return false;
      const photos = Array.isArray(marker.photo_urls) ? marker.photo_urls : 
                    typeof marker.photo_urls === 'string' ? JSON.parse(marker.photo_urls || '[]') : [];
      return photos.length > 0;
    },
    message: 'Загрузите фотографии места',
    priority: 'high'
  },
  {
    field: 'address',
    weight: 10,
    check: (marker) => marker.address && marker.address.trim().length >= 10,
    message: 'Укажите точный адрес (минимум 10 символов)',
    priority: 'medium'
  },
  {
    field: 'working_hours',
    weight: 8,
    check: (marker) => {
      // Обязательно для бизнес-категорий
      const requiresWorkingHours = ['restaurant', 'cafe', 'shop', 'hotel', 'museum', 'business'].includes(marker.category);
      if (!requiresWorkingHours) return true; // Не требуется для природных объектов
      return marker.working_hours && marker.working_hours.trim().length > 0;
    },
    message: 'Укажите время работы',
    priority: 'medium',
    conditional: ['restaurant', 'cafe', 'shop', 'hotel', 'museum', 'business']
  },
  {
    field: 'contact_info',
    weight: 7,
    check: (marker) => {
      // Обязательно для коммерческих объектов
      const requiresContact = ['restaurant', 'cafe', 'shop', 'hotel', 'business'].includes(marker.category);
      if (!requiresContact) return true; // Не требуется для природных объектов
      return marker.contact_info && marker.contact_info.trim().length > 0;
    },
    message: 'Добавьте контактную информацию (телефон, сайт)',
    priority: 'low',
    conditional: ['restaurant', 'cafe', 'shop', 'hotel', 'business']
  },
  {
    field: 'detailed_info',
    weight: 15,
    check: (marker) => {
      // Дополнительная информация, советы, особенности
      return marker.detailed_info && marker.detailed_info.trim().length >= 100;
    },
    message: 'Поделитесь практическими советами и особенностями (минимум 100 символов)',
    priority: 'high'
  }
];

/**
 * Рассчитывает полноту заполнения метки
 * @param {Object} marker - объект метки
 * @returns {Object} результат анализа полноты
 */
function calculateMarkerCompleteness(marker) {
  let totalScore = 0;
  let maxPossibleScore = 0;
  let filledRequiredFields = 0;
  let totalRequiredFields = 0;
  let suggestions = [];

  REQUIRED_FIELDS.forEach(({ field, weight, check, message, priority, conditional }) => {
    // Проверяем, применимо ли поле к данной категории
    if (conditional && !conditional.includes(marker.category)) {
      return; // Поле не требуется для этой категории
    }

    totalRequiredFields++;
    maxPossibleScore += weight;

    const isFieldComplete = check(marker);
    
    if (isFieldComplete) {
      totalScore += weight;
      filledRequiredFields++;
    } else {
      suggestions.push({
        field,
        message,
        priority,
        weight,
        category: marker.category
      });
    }
  });

  // Рассчитываем итоговый балл (0-100)
  const completenessScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
  
  // Сортируем предложения по приоритету и весу
  suggestions.sort((a, b) => {
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.weight - a.weight;
  });

  return {
    score: completenessScore,
    filledRequiredFields,
    totalRequiredFields,
    suggestions,
    needsCompletion: completenessScore < 80,
    status: getCompletenessStatus(completenessScore),
    maxPossibleScore,
    currentScore: totalScore
  };
}

/**
 * Определяет статус полноты метки
 * @param {number} score - балл полноты (0-100)
 * @returns {string} статус
 */
function getCompletenessStatus(score) {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 60) return 'acceptable';
  if (score >= 40) return 'poor';
  return 'incomplete';
}

/**
 * Получает человекочитаемое описание статуса
 * @param {string} status - статус полноты
 * @returns {Object} описание статуса
 */
function getStatusDescription(status) {
  const descriptions = {
    excellent: {
      text: 'Отлично заполнено',
      color: 'green',
      icon: '🌟'
    },
    good: {
      text: 'Хорошо заполнено', 
      color: 'blue',
      icon: '✅'
    },
    acceptable: {
      text: 'Приемлемо заполнено',
      color: 'yellow', 
      icon: '⚠️'
    },
    poor: {
      text: 'Плохо заполнено',
      color: 'orange',
      icon: '📝'
    },
    incomplete: {
      text: 'Требует дополнения',
      color: 'red',
      icon: '❗'
    }
  };
  
  return descriptions[status] || descriptions.incomplete;
}

/**
 * Анализирует какие поля можно улучшить для получения лучшего рейтинга
 * @param {Object} marker - объект метки
 * @returns {Array} приоритетные улучшения
 */
function getPriorityImprovements(marker) {
  const completeness = calculateMarkerCompleteness(marker);
  
  // Возвращаем топ-3 наиболее важных улучшения
  return completeness.suggestions
    .slice(0, 3)
    .map(suggestion => ({
      ...suggestion,
      potentialScoreIncrease: suggestion.weight,
      estimatedNewScore: Math.min(100, completeness.score + suggestion.weight)
    }));
}

/**
 * Проверяет, изменился ли уровень полноты метки
 * @param {number} oldScore - старый балл
 * @param {number} newScore - новый балл  
 * @returns {Object} информация об изменении
 */
function checkCompletenessLevelChange(oldScore, newScore) {
  const oldStatus = getCompletenessStatus(oldScore);
  const newStatus = getCompletenessStatus(newScore);
  
  return {
    changed: oldStatus !== newStatus,
    oldStatus,
    newStatus,
    improved: newScore > oldScore,
    scoreIncrease: newScore - oldScore
  };
}

export {
  calculateMarkerCompleteness,
  getCompletenessStatus,
  getStatusDescription,
  getPriorityImprovements,
  checkCompletenessLevelChange,
  REQUIRED_FIELDS
};
