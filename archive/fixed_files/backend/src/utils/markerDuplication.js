/**
 * Система предотвращения дублирования меток
 * Проверяет географическую близость и схожесть названий
 */

import pool from '../../db.js';

/**
 * Рассчитывает схожесть двух строк (алгоритм Левенштейна)
 * @param {string} str1 - первая строка
 * @param {string} str2 - вторая строка
 * @returns {number} схожесть от 0 до 1
 */
function calculateStringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  // Расстояние Левенштейна
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Рассчитывает расстояние Левенштейна между двумя строками
 * @param {string} str1 - первая строка
 * @param {string} str2 - вторая строка  
 * @returns {number} расстояние Левенштейна
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Проверка на дублирование меток
 * @param {number} lat - широта новой метки
 * @param {number} lng - долгота новой метки  
 * @param {string} title - название новой метки
 * @param {Object} options - дополнительные параметры
 * @returns {Promise<Object>} результат проверки
 */
export async function checkForDuplicateMarkers(lat, lng, title, options = {}) {
  const {
    radius = 100, // радиус поиска в метрах
// SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1481): original:     similarityThreshold = 0.6, // порог схожести названий (0-1)
    excludeMarkerId = null, // исключить метку из поиска (для редактирования)
    category = null // категория метки
  } = options;

  try {
    // Используем формулу гаверсинуса для расчета расстояния без PostGIS
    let query = `
      SELECT 
        id,
        title,
        description,
        category,
        latitude,
        longitude,
        completeness_score,
        needs_completion,
        creator_id,
        created_at,
        (
          6371000 * acos(
            cos(radians($1)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(latitude))
          )
        ) as distance
      FROM map_markers 
      WHERE is_active = true
        AND (
          -- Фильтруем по примерному квадрату (быстрая предварительная фильтрация)
          latitude BETWEEN $1 - ($4 / 111000.0) AND $1 + ($4 / 111000.0)
          AND longitude BETWEEN $2 - ($4 / (111000.0 * cos(radians($1)))) AND $2 + ($4 / (111000.0 * cos(radians($1))))
        )
        AND (
          -- Проверяем схожесть названий
          LOWER(title) LIKE LOWER($5)
          OR LOWER($3) LIKE LOWER('%' || title || '%')
          OR title ILIKE '%' || $3 || '%'
        )
    `;

    const params = [lat, lng, title, radius, `%${title}%`];
    let paramIndex = 6;

    // Исключаем определенную метку (для случая редактирования)
    if (excludeMarkerId) {
      query += ` AND id != $${paramIndex}`;
      params.push(excludeMarkerId);
      paramIndex++;
    }

    // Фильтруем по категории, если указана
    if (category && category !== 'other') {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    query += ` ORDER BY distance ASC`;

    const result = await pool.query(query, params);
    
    // Фильтруем результаты по точному расстоянию и анализируем найденные дубликаты
    const duplicates = result.rows
      .filter(row => parseFloat(row.distance) <= radius)
      .map(row => {
      const distance = Math.round(parseFloat(row.distance));
      const titleSimilarity = calculateStringSimilarity(title, row.title);
      
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        coordinates: {
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude)
        },
        distance,
        titleSimilarity,
        completenessScore: row.completeness_score || 0,
        needsCompletion: row.needs_completion,
        creatorId: row.creator_id,
        createdAt: row.created_at,
        // Анализ типа дублирования
        duplicationType: analyzeDuplicationType(
          distance,
          titleSimilarity,
          row.category,
          category
        ),
        // Рекомендация действия
        recommendedAction: getRecommendedAction(
          distance,
          titleSimilarity,
          row.completeness_score || 0,
          row.needs_completion
        )
      };
    });

    // Классифицируем результат
    const analysis = analyzeDuplicationRisk(duplicates, { lat, lng, title, category });

    return {
      hasDuplicates: duplicates.length > 0,
      duplicatesCount: duplicates.length,
      duplicates,
      analysis,
      recommendation: getOverallRecommendation(analysis, duplicates)
    };

  } catch (error) {
    console.error('Ошибка при проверке дублирования меток:', error);
    throw new Error(`Ошибка проверки дублирования: ${error.message}`);
  }
}

/**
 * Анализирует тип дублирования
 * @param {number} distance - расстояние в метрах
 * @param {number} similarity - схожесть названий (0-1)
 * @param {string} existingCategory - категория существующей метки
 * @param {string} newCategory - категория новой метки
 * @returns {string} тип дублирования
 */
function analyzeDuplicationType(distance, similarity, existingCategory, newCategory) {
  if (distance <= 10 && similarity > 0.8) {
    return 'exact_duplicate'; // Точный дубликат
  }
  
  if (distance <= 50 && similarity > 0.7) {
    return 'likely_duplicate'; // Вероятный дубликат
  }
  
  if (distance <= 100 && similarity > 0.9) {
    return 'same_location_different_name'; // То же место, другое название
  }
  
  if (distance <= 20 && existingCategory === newCategory) {
    return 'same_category_close'; // Та же категория рядом
  }
  
  if (similarity > 0.8 && distance <= 200) {
    return 'similar_name_nearby'; // Похожее название поблизости
  }
  
  return 'potential_duplicate'; // Потенциальный дубликат
}

/**
 * Получает рекомендуемое действие для дубликата
 * @param {number} distance - расстояние в метрах
 * @param {number} similarity - схожесть названий
 * @param {number} completenessScore - балл полноты существующей метки
 * @param {boolean} needsCompletion - нужно ли дополнение
 * @returns {string} рекомендуемое действие
 */
function getRecommendedAction(distance, similarity, completenessScore, needsCompletion) {
  if (distance <= 10 && similarity > 0.8) {
    return 'block_creation'; // Заблокировать создание
  }
  
  if (distance <= 50 && similarity > 0.7) {
    if (needsCompletion && completenessScore < 60) {
      return 'suggest_contribution'; // Предложить дополнить существующую
    }
    return 'warn_user'; // Предупредить пользователя
  }
  
  if (completenessScore < 40 && needsCompletion) {
    return 'suggest_contribution'; // Предложить дополнить
  }
  
  return 'allow_with_warning'; // Разрешить с предупреждением
}

/**
 * Анализирует общий риск дублирования
 * @param {Array} duplicates - массив найденных дубликатов
 * @param {Object} newMarker - данные новой метки
 * @returns {Object} анализ риска
 */
function analyzeDuplicationRisk(duplicates, newMarker) {
  if (duplicates.length === 0) {
    return {
      riskLevel: 'none',
      message: 'Дубликатов не найдено',
      canProceed: true
    };
  }

  const exactDuplicates = duplicates.filter(d => d.duplicationType === 'exact_duplicate');
  const likelyDuplicates = duplicates.filter(d => d.duplicationType === 'likely_duplicate');
  const incompleteNearby = duplicates.filter(d => d.needsCompletion && d.completenessScore < 60);

  if (exactDuplicates.length > 0) {
    return {
      riskLevel: 'critical',
      message: 'Найден точный дубликат. Создание заблокировано.',
      canProceed: false,
      primaryIssue: 'exact_duplicate',
      affectedMarkers: exactDuplicates.length
    };
  }

  if (likelyDuplicates.length > 0) {
    return {
      riskLevel: 'high',
      message: 'Найдены вероятные дубликаты. Рекомендуется проверить.',
      canProceed: true,
      requiresConfirmation: true,
      primaryIssue: 'likely_duplicate',
      affectedMarkers: likelyDuplicates.length
    };
  }

  if (incompleteNearby.length > 0) {
    return {
      riskLevel: 'medium',
      message: 'Рядом есть неполные метки. Рассмотрите возможность их дополнения.',
      canProceed: true,
      primaryIssue: 'incomplete_nearby',
      affectedMarkers: incompleteNearby.length,
      suggestion: 'contribute_to_existing'
    };
  }

  return {
    riskLevel: 'low',
    message: 'Найдены похожие метки, но они не являются дубликатами.',
    canProceed: true,
    primaryIssue: 'similar_nearby',
    affectedMarkers: duplicates.length
  };
}

/**
 * Получает общую рекомендацию на основе анализа
 * @param {Object} analysis - результат анализа риска
 * @param {Array} duplicates - массив дубликатов
 * @returns {Object} общая рекомендация
 */
function getOverallRecommendation(analysis, duplicates) {
  const recommendation = {
    action: 'allow', // allow, warn, block
    message: '',
    alternatives: [],
    requiresConfirmation: false
  };

  switch (analysis.riskLevel) {
    case 'critical':
      recommendation.action = 'block';
      recommendation.message = 'Создание метки заблокировано из-за точного дубликата.';
      recommendation.alternatives = duplicates
        .filter(d => d.duplicationType === 'exact_duplicate')
        .map(d => ({
          id: d.id,
          title: d.title,
          action: 'use_existing',
          message: `Используйте существующую метку "${d.title}"`
        }));
      break;

    case 'high':
      recommendation.action = 'warn';
      recommendation.message = 'Обнаружены похожие метки поблизости. Проверьте, не дублируете ли вы существующий контент.';
      recommendation.requiresConfirmation = true;
      recommendation.alternatives = duplicates
        .slice(0, 3)
        .map(d => ({
          id: d.id,
          title: d.title,
          distance: d.distance,
          action: d.needsCompletion ? 'contribute' : 'use_existing',
          message: d.needsCompletion ? 
            `Дополните существующую метку "${d.title}" (${d.distance}м)` :
            `Используйте существующую метку "${d.title}" (${d.distance}м)`
        }));
      break;

    case 'medium':
      recommendation.action = 'warn';
      recommendation.message = 'Рядом есть неполные метки. Рассмотрите возможность их улучшения вместо создания новой.';
      recommendation.alternatives = duplicates
        .filter(d => d.needsCompletion)
        .slice(0, 2)
        .map(d => ({
          id: d.id,
          title: d.title,
          distance: d.distance,
          completeness: d.completenessScore,
          action: 'contribute',
          message: `Дополните "${d.title}" (${d.completenessScore}% заполнено, ${d.distance}м)`
        }));
      break;

    default:
      recommendation.action = 'allow';
      recommendation.message = 'Метку можно создать. Похожие метки найдены, но они не являются дубликатами.';
  }

  return recommendation;
}

/**
 * Получает список меток для предложения вместо создания новой
 * @param {number} lat - широта
 * @param {number} lng - долгота  
 * @param {string} category - категория
 * @param {number} radius - радиус поиска
 * @returns {Promise<Array>} список меток для улучшения
 */
export async function getNearbyIncompleteMarkers(lat, lng, category = null, radius = 500) {
  try {
    let query = `
      SELECT 
        id,
        title,
        description,
        category,
        latitude,
        longitude,
        completeness_score,
        completion_suggestions,
        creator_id,
        (
          6371000 * acos(
            cos(radians($1)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(latitude))
          )
        ) as distance
      FROM map_markers 
      WHERE is_active = true
        AND needs_completion = true
        AND completeness_score < 80
        AND (
          -- Фильтруем по примерному квадрату
          latitude BETWEEN $1 - ($3 / 111000.0) AND $1 + ($3 / 111000.0)
          AND longitude BETWEEN $2 - ($3 / (111000.0 * cos(radians($1)))) AND $2 + ($3 / (111000.0 * cos(radians($1))))
        )
    `;

    const params = [lat, lng, radius];
    let paramIndex = 4;

    if (category && category !== 'other') {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    query += ` ORDER BY completeness_score ASC, distance ASC LIMIT 5`;

    const result = await pool.query(query, params);
    
    // Фильтруем по точному расстоянию в JavaScript
    const filteredRows = result.rows.filter(row => parseFloat(row.distance) <= radius);
    
    return filteredRows.map(row => {
      let suggestions = [];
      try {
        suggestions = row.completion_suggestions ? 
          JSON.parse(row.completion_suggestions) : [];
      } catch (error) {
        console.warn('Ошибка парсинга completion_suggestions:', error);
        suggestions = [];
      }
      
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        coordinates: {
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude)
        },
        distance: Math.round(parseFloat(row.distance)),
        completenessScore: row.completeness_score || 0,
        topSuggestions: suggestions.slice(0, 3),
        estimatedImpact: suggestions.reduce((sum, s) => sum + (s.weight || 0), 0),
        creatorId: row.creator_id
      };
    });

  } catch (error) {
    console.error('Ошибка при поиске неполных меток:', error);
    return [];
  }
}

/**
 * Проверяет, может ли пользователь создать метку в данном месте
 * @param {string} userId - ID пользователя
 * @param {number} lat - широта
 * @param {number} lng - долгота
 * @returns {Promise<Object>} результат проверки
 */
export async function checkUserCanCreateMarker(userId, lat, lng) {
  try {
    // Проверяем количество меток пользователя в радиусе 1км за последние 24 часа
    const recentMarkersResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM map_markers 
      WHERE creator_id = $1
        AND is_active = true
        AND created_at > NOW() - INTERVAL '24 hours'
        AND (
          6371000 * acos(
            cos(radians($2)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians($3)) + 
            sin(radians($2)) * sin(radians(latitude))
          )
        ) <= 1000
    `, [userId, lat, lng]);

    const recentCount = parseInt(recentMarkersResult.rows[0]?.count || 0);
    const maxMarkersPerDay = 10; // Максимум 10 меток в радиусе 1км за 24 часа

    if (recentCount >= maxMarkersPerDay) {
      return {
        canCreate: false,
        reason: 'rate_limit',
        message: `Вы создали ${recentCount} меток в этом районе за последние 24 часа. Лимит: ${maxMarkersPerDay}.`,
        retryAfter: '24 hours'
      };
    }

    return {
      canCreate: true,
      recentCount,
      remainingToday: maxMarkersPerDay - recentCount
    };

  } catch (error) {
    console.error('Ошибка при проверке лимитов пользователя:', error);
    return {
      canCreate: true, // В случае ошибки разрешаем создание
      error: error.message
    };
  }
}



