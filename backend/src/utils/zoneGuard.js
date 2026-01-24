// In-memory store of polygons (GeoJSON-like)
// Each zone: { id?, name?, type?, severity?: 'critical'|'restricted'|'warning', polygons: [[[lon,lat]...]], bbox?: [minX,minY,maxX,maxY] }

/** @type {Array<{id?:string,name?:string,type?:string,severity?:string,polygons:number[][][],bbox?:number[]}>} */
const zonesStore = [];

function computeBBox(coords) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

function bboxIntersectsPoint(bbox, x, y) {
  const [minX, minY, maxX, maxY] = bbox;
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

// Ray-casting algorithm for point in polygon (lon,lat)
function pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function clearZones() {
  zonesStore.length = 0;
}

export function addZonesFromGeoJSON(geojson) {
  if (!geojson) return 0;
  const features = geojson.type === 'FeatureCollection' ? geojson.features : [geojson];
  let count = 0;
  for (const f of features) {
    if (!f || !f.geometry) continue;
    const props = f.properties || {};
    const severity = props.severity || 'restricted';
    const type = props.type || props.zone_type || 'unknown';
    const name = props.name || props.title || 'Zone';
    if (f.geometry.type === 'Polygon') {
      const rings = f.geometry.coordinates || [];
      const outer = rings[0] || [];
      const zone = {
        name,
        type,
        severity,
        polygons: [outer],
      };
      zone.bbox = computeBBox(outer);
      zonesStore.push(zone);
      count += 1;
    } else if (f.geometry.type === 'MultiPolygon') {
      const multi = f.geometry.coordinates || [];
      for (const poly of multi) {
        const outer = poly[0] || [];
        const zone = {
          name,
          type,
          severity,
          polygons: [outer],
        };
        zone.bbox = computeBBox(outer);
        zonesStore.push(zone);
        count += 1;
      }
    }
  }
  return count;
}

export async function checkPointAgainstZones(longitude, latitude) {
  const hits = [];
  for (const z of zonesStore) {
    if (z.bbox && !bboxIntersectsPoint(z.bbox, longitude, latitude)) continue;
    for (const ring of z.polygons) {
      if (pointInPolygon([longitude, latitude], ring)) {
        hits.push({ name: z.name, type: z.type, severity: z.severity });
        break;
      }
    }
  }
  return hits;
}

export async function checkLineAgainstZones(coordinates) {
  // Simplified: check vertices; refine later with segment-polygon intersect
  const aggregated = new Map();
  for (const [lon, lat] of coordinates) {
    const hits = await checkPointAgainstZones(lon, lat);
    for (const h of hits) {
      const key = `${h.name}|${h.type}|${h.severity}`;
      aggregated.set(key, h);
    }
  }
  return Array.from(aggregated.values());
}

export function getZonesStats() {
  const summary = zonesStore.reduce((acc, z) => {
    acc.total += 1;
    acc.bySeverity[z.severity] = (acc.bySeverity[z.severity] || 0) + 1;
    acc.byType[z.type] = (acc.byType[z.type] || 0) + 1;
    return acc;
  }, { total: 0, bySeverity: {}, byType: {} });
  return summary;
}

export function getZonesSnapshot() {
  // Return a safe shallow copy without functions
  return zonesStore.map(z => ({
    name: z.name,
    type: z.type,
    severity: z.severity,
    polygons: z.polygons,
    bbox: z.bbox,
  }));
}

