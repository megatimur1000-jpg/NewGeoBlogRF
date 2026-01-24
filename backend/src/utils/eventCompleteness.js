/**
 * Оценка полноты события и расчет очков за вклад (MVP)
 */

// Набор проверок для события
const REQUIRED_FIELDS = [
  {
    field: 'title',
    weight: 20,
    check: (e) => typeof e.title === 'string' && e.title.trim().length >= 5,
    message: 'Добавьте информативное название (≥ 5 символов)',
    priority: 'high'
  },
  {
    field: 'description',
    weight: 25,
    check: (e) => typeof e.description === 'string' && e.description.trim().length >= 80,
    message: 'Опишите событие подробнее (≥ 80 символов)',
    priority: 'high'
  },
  {
    field: 'date',
    weight: 15,
    check: (e) => !!e.date,
    message: 'Укажите дату проведения',
    priority: 'high'
  },
  {
    field: 'city',
    weight: 10,
    check: (e) => typeof e.city === 'string' && e.city.trim().length > 0,
    message: 'Укажите город/населённый пункт',
    priority: 'medium'
  },
  {
    field: 'coordinates',
    weight: 10,
    check: (e) => (typeof e.latitude === 'number' && typeof e.longitude === 'number') ||
                  (typeof e.lat === 'number' && typeof e.lng === 'number'),
    message: 'Добавьте координаты места проведения',
    priority: 'medium'
  },
  {
    field: 'cover_photo',
    weight: 10,
    check: (e) => {
      const photos = Array.isArray(e.photo_urls) ? e.photo_urls : Array.isArray(e.photos) ? e.photos : [];
      return photos.length > 0;
    },
    message: 'Добавьте фото/обложку события',
    priority: 'medium'
  },
  {
    field: 'category',
    weight: 10,
    check: (e) => typeof e.category === 'string' && e.category.trim().length > 0,
    message: 'Выберите категорию события',
    priority: 'low'
  }
];

function getStatus(score) {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 60) return 'acceptable';
  if (score >= 40) return 'poor';
  return 'incomplete';
}

export function calculateEventCompleteness(eventRow) {
  let score = 0;
  let maxScore = 0;
  let filled = 0;
  let total = 0;
  const suggestions = [];

  for (const rule of REQUIRED_FIELDS) {
    total++;
    maxScore += rule.weight;
    const ok = safeCheck(rule.check, eventRow);
    if (ok) {
      score += rule.weight;
      filled++;
    } else {
      suggestions.push({ field: rule.field, message: rule.message, priority: rule.priority, weight: rule.weight });
    }
  }

  const percent = maxScore ? Math.round((score / maxScore) * 100) : 0;
  suggestions.sort((a, b) => {
    const p = { high: 3, medium: 2, low: 1 };
    if (p[a.priority] !== p[b.priority]) return p[b.priority] - p[a.priority];
    return b.weight - a.weight;
  });

  return {
    score: percent,
    status: getStatus(percent),
    filledRequiredFields: filled,
    totalRequiredFields: total,
    suggestions,
    maxPossibleScore: maxScore,
    currentScore: score,
    needsCompletion: percent < 80
  };
}

function safeCheck(fn, row) {
  try { return !!fn(row); } catch { return false; }
}

// Расчет очков за событие (MVP):
// basePoints по статусу + attachmentPoints за добавленные сущности рядом
export function computeEventPoints(eventRow, completeness) {
  const statusPoints = { excellent: 50, good: 35, acceptable: 20, poor: 10, incomplete: 0 };
  const basePoints = statusPoints[completeness.status] || 0;

  // attachments — допускаем различные имена свойств (могут быть массивы id или объектов)
  const hotels = toCount(eventRow.attached_hotels || eventRow.hotels || []);
  const parking = toCount(eventRow.attached_parking || eventRow.parking || []);
  const routes = toCount(eventRow.attached_routes || eventRow.routes || []);
  const restaurants = toCount(eventRow.attached_restaurants || eventRow.restaurants || []);

  const attachmentPoints = hotels * 5 + parking * 3 + routes * 8 + restaurants * 4;

  return {
    basePoints,
    attachmentPoints,
    totalPoints: basePoints + attachmentPoints,
    breakdown: {
      hotels, parking, routes, restaurants
    }
  };
}

function toCount(val) {
  if (!val) return 0;
  if (Array.isArray(val)) return val.length;
  // если пришла строка JSON
  try {
    const arr = JSON.parse(val);
    return Array.isArray(arr) ? arr.length : 0;
  } catch { return 0; }
}


