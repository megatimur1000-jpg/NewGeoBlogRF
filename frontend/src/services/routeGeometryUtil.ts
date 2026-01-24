export type LatLng = [number, number]; // [lat, lon]

interface RouteLike {
  id?: string;
  points?: LatLng[];
  route_data?: {
    geometry?: LatLng[];
    points?: LatLng[];
  } | null;
}

/**
 * Проверяет, является ли геометрия "прямой линией" (только начало и конец)
 */
function isStraightLine(geometry: LatLng[]): boolean {
  return geometry.length === 2;
}

/**
 * Проверяет, лежат ли все точки на прямой линии
 */
function arePointsOnStraightLine(geometry: LatLng[]): boolean {
  if (geometry.length <= 2) return true; // 1-2 точки всегда на прямой
  
  const [start, end] = [geometry[0], geometry[geometry.length - 1]];
  const dx = end[1] - start[1]; // разница по долготе
  const dy = end[0] - start[0]; // разница по широте
  
  // Если начало и конец совпадают
  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) return false;
  
  // Проверяем каждую промежуточную точку
  const THRESHOLD = 0.01; // ~1км отклонение
  for (let i = 1; i < geometry.length - 1; i++) {
    const point = geometry[i];
    const t = ((point[1] - start[1]) * dx + (point[0] - start[0]) * dy) / (dx * dx + dy * dy);
    const projection = [start[0] + t * dy, start[1] + t * dx];
    const distance = Math.sqrt(
      Math.pow(point[0] - projection[0], 2) + Math.pow(point[1] - projection[1], 2)
    );
    if (distance > THRESHOLD) return false; // Есть точка с большим отклонением
  }
  return true; // Все точки лежат на прямой
}

/**
 * Returns renderable geometry for MapsGL/Blog/Post from saved snapped geometry if available,
 * but ONLY if it's a properly built route (more than 2 points AND not a straight line).
 * If saved geometry is a straight line, we need to rebuild it via ORS API.
 * 
 * NOTE: This function returns geometry synchronously. Components should check if it's a straight
 * line and rebuild via ORS API if needed.
 */
export function getRenderableRouteGeometry(route: RouteLike | null | undefined): LatLng[] {
  if (!route) return [];
  const saved = route.route_data as any;
  const savedGeom: LatLng[] | undefined = saved?.geometry;
  
  // Если есть сохранённая геометрия
  if (Array.isArray(savedGeom) && savedGeom.length >= 2) {
    // Проверяем, не является ли она прямой линией
    // Если это прямая линия (2 точки или все точки лежат на прямой), вернём её для перестроения
    // Компонент должен проверить и перестроить через ORS
    return savedGeom;
  }
  
  // Fallback на точки маршрута
  const savedPoints: LatLng[] | undefined = saved?.points;
  if (Array.isArray(savedPoints) && savedPoints.length >= 2) return savedPoints;
  const pts: LatLng[] | undefined = (route as any).points;
  if (Array.isArray(pts) && pts.length >= 2) return pts;
  return [];
}



