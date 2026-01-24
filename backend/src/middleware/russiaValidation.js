/**
 * Middleware для проверки российских ограничений
 */

// Российские границы с буфером 5км
const RUSSIA_BOUNDS = {
  north: 81.86,   // Северная граница (мыс Челюскин) + буфер
  south: 41.0,     // Южная граница РФ (Дагестан)
  east: 180.0,     // Восточная граница (максимальная долгота для восточной части)
  west: 19.63      // Западная граница РФ (Калининградская область)
};

/**
 * Проверяет, находится ли точка в пределах РФ
 * @param {number} lat - широта
 * @param {number} lng - долгота
 * @returns {boolean}
 */
export const isWithinRussiaBounds = (lat, lng) => {
  // Проверяем стандартные границы для основной части России
  const isInStandardBounds = 
    lat >= RUSSIA_BOUNDS.south &&  // широта >= южная граница
    lat <= RUSSIA_BOUNDS.north &&  // широта <= северная граница  
    lng >= RUSSIA_BOUNDS.west &&   // долгота >= западная граница
    lng <= RUSSIA_BOUNDS.east;     // долгота <= восточная граница (до 180°)
  
  // Проверяем Чукотку и другие регионы с отрицательной долготой (западнее 180°)
  // Чукотка находится примерно на долготе -169° до -180°
  const isInChukotkaRegion = 
    lat >= 64.0 && lat <= 71.0 &&  // Чукотка примерно в этом диапазоне широты
    lng >= -180.0 && lng <= -169.0;  // Отрицательная долгота для Чукотки
  
  return isInStandardBounds || isInChukotkaRegion;
};

/**
 * Middleware для проверки координат маркера
 */
export const validateMarkerCoordinates = (req, res, next) => {
  const { latitude, longitude } = req.body;
  
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    if (!isWithinRussiaBounds(latitude, longitude)) {
      return res.status(422).json({
        message: 'Маркер должен находиться в пределах Российской Федерации',
        coordinates: { latitude, longitude },
        russiaBounds: RUSSIA_BOUNDS
      });
    }
  }
  
  next();
};

/**
 * Middleware для проверки координат маршрута
 */
export const validateRouteCoordinates = (req, res, next) => {
  const { route_data } = req.body;
  
  if (route_data && route_data.points && Array.isArray(route_data.points)) {
    const invalidPoints = route_data.points.filter(point => {
      if (typeof point.latitude === 'number' && typeof point.longitude === 'number') {
        return !isWithinRussiaBounds(point.latitude, point.longitude);
      }
      return false;
    });

    if (invalidPoints.length > 0) {
      return res.status(422).json({
        message: `Маршрут содержит ${invalidPoints.length} точек за пределами РФ`,
        invalidPoints: invalidPoints.map(p => ({ lat: p.latitude, lng: p.longitude })),
        russiaBounds: RUSSIA_BOUNDS
      });
    }
  }
  
  next();
};

/**
 * Middleware для проверки событий
 */
export const validateEventCoordinates = (req, res, next) => {
  const { latitude, longitude, location } = req.body;
  
  // Проверяем координаты события
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    if (!isWithinRussiaBounds(latitude, longitude)) {
      return res.status(422).json({
        message: 'Событие должно проходить в пределах Российской Федерации',
        coordinates: { latitude, longitude },
        location,
        russiaBounds: RUSSIA_BOUNDS
      });
    }
  }
  
  next();
};

/**
 * Middleware для проверки блогов/постов
 */
export const validateBlogCoordinates = (req, res, next) => {
  const { location, coordinates } = req.body;
  
  // Если есть координаты в блоге
  if (coordinates && typeof coordinates.latitude === 'number' && typeof coordinates.longitude === 'number') {
    if (!isWithinRussiaBounds(coordinates.latitude, coordinates.longitude)) {
      return res.status(422).json({
        message: 'Контент должен быть связан с местами в пределах Российской Федерации',
        coordinates,
        location,
        russiaBounds: RUSSIA_BOUNDS
      });
    }
  }
  
  next();
};

/**
 * Получить границы РФ
 */
export const getRussiaBounds = () => RUSSIA_BOUNDS;

/**
 * Проверить координаты
 */
export const checkCoordinates = (lat, lng) => {
  return {
    isValid: isWithinRussiaBounds(lat, lng),
    bounds: RUSSIA_BOUNDS,
    coordinates: { latitude: lat, longitude: lng }
  };
};

export default {
  validateMarkerCoordinates,
  validateRouteCoordinates,
  validateEventCoordinates,
  validateBlogCoordinates,
  getRussiaBounds,
  checkCoordinates,
  isWithinRussiaBounds
};
