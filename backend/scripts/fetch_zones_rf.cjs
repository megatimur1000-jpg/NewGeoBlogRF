/* eslint-disable no-console */
const axios = require('axios');

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://z.overpass-api.de/api/interpreter'
];

const BACKEND_IMPORT_URL = process.env.ZONES_IMPORT_URL || 'http://localhost:3002/api/zones/import';

// Примерные bbox по федеральным округам РФ (минLon, минLat, максLon, максLat)
// При необходимости уточним полигонами границ. Для зон достаточно крупных bbox.
const DISTRICTS = {
  cfo: [30.0, 52.0, 42.0, 58.5],         // Центральный
  szfo: [26.0, 58.0, 60.0, 69.0],        // Северо-Западный
  yfo: [36.0, 44.0, 50.0, 58.5],         // Южный (прибл. + часть СКФО)
  skfo: [40.0, 41.0, 48.5, 47.5],        // Северо-Кавказский (компактнее)
  pfo: [45.0, 52.0, 56.5, 58.5],         // Приволжский
  urfo: [56.0, 53.0, 75.0, 67.0],        // Уральский
  sfo: [60.0, 49.0, 90.0, 75.0],         // Сибирский
  dfo: [120.0, 42.0, 165.0, 75.0]        // Дальневосточный
};

function bboxToQuery([minLon, minLat, maxLon, maxLat]) {
  return `${minLat},${minLon},${maxLat},${maxLon}`;
}

function overpassQuery(bbox) {
  const box = bboxToQuery(bbox);
  return `
  [out:json][timeout:120];
  (
    way["landuse"="military"](${box});
    rel["landuse"="military"](${box});
    way["military"](${box});
    rel["military"](${box});

    way["aeroway"~"^(aerodrome|runway|helipad|heliport)$"](${box});
    rel["aeroway"~"^(aerodrome|runway|helipad|heliport)$"](${box});

    way["boundary"="protected_area"](${box});
    rel["boundary"="protected_area"](${box});
  );
  out body;
  >;
  out skel qt;
  `;
}

async function fetchOverpass(query) {
  let lastErr;
  for (const url of OVERPASS_ENDPOINTS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { data } = await axios.post(url, query, { headers: { 'Content-Type': 'text/plain; charset=utf-8' }, timeout: 180000 });
        if (!data || typeof data !== 'object' || !Array.isArray(data.elements)) {
          throw new Error('Non-JSON or invalid Overpass response');
        }
        return data;
      } catch (e) {
        lastErr = e;
        const delay = 1000 * attempt;
        console.warn(`Overpass attempt ${attempt} failed at ${url}. Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

function splitBBox([minLon, minLat, maxLon, maxLat]) {
  const midLon = (minLon + maxLon) / 2;
  const midLat = (minLat + maxLat) / 2;
  return [
    [minLon, minLat, midLon, midLat],
    [midLon, minLat, maxLon, midLat],
    [minLon, midLat, midLon, maxLat],
    [midLon, midLat, maxLon, maxLat]
  ];
}

function buildNodesMap(elements) {
  const map = new Map();
  for (const el of elements) {
    if (el.type === 'node') map.set(el.id, [el.lon, el.lat]);
  }
  return map;
}

function assemblePolygons(elements, nodesMap) {
  const polygons = [];
  for (const el of elements) {
    if (el.type === 'way' && Array.isArray(el.nodes) && el.nodes.length >= 3) {
      const coords = el.nodes.map(id => nodesMap.get(id)).filter(Boolean);
      if (coords.length >= 3) {
        const first = coords[0];
        const last = coords[coords.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) coords.push(first);
        polygons.push({ coords, tags: el.tags || {} });
      }
    }
  }
  return polygons;
}

function tagToSeverityAndType(tags = {}) {
  if (tags.landuse === 'military' || tags.military) return { severity: 'critical', type: 'military' };
  if (tags.aeroway) return { severity: 'restricted', type: 'aerodrome' };
  if (tags.boundary === 'protected_area') return { severity: 'warning', type: 'protected_area' };
  return { severity: 'restricted', type: 'restricted' };
}

function groupByType(polygons) {
  const groups = new Map();
  for (const p of polygons) {
    const { severity, type } = tagToSeverityAndType(p.tags);
    const name = p.tags?.name || `${type}`;
    const key = `${type}:${severity}`;
    if (!groups.has(key)) groups.set(key, { name, type, severity, polygons: [] });
    groups.get(key).polygons.push(p.coords);
  }
  return Array.from(groups.values());
}

async function importZones(groups) {
  const payload = { type: 'FeatureCollection', features: groups.map(z => ({ properties: { name: z.name, type: z.type, severity: z.severity }, geometry: { type: 'MultiPolygon', coordinates: z.polygons.map(ring => [ring]) } })) };
  const resp = await axios.post(BACKEND_IMPORT_URL, payload, { headers: { 'Content-Type': 'application/json' } });
  return resp.data;
}

async function processDistrict(key) {
  const bbox = DISTRICTS[key];
  if (!bbox) throw new Error(`Unknown district key: ${key}`);
  console.log(`\n=== ${key.toUpperCase()} ===`);
  const tiles = splitBBox(bbox);
  let all = [];
  for (const tile of tiles) {
    const data = await fetchOverpass(overpassQuery(tile));
    console.log(`Tile -> elements: ${data.elements.length}`);
    all = all.concat(data.elements);
  }
  const nodesMap = buildNodesMap(all);
  const polygons = assemblePolygons(all, nodesMap);
  console.log(`Polygons: ${polygons.length}`);
  const groups = groupByType(polygons);
  console.log(`Groups: ${groups.length}. Importing...`);
  const res = await importZones(groups);
  console.log('Import stats:', res?.stats || res);
}

async function main() {
  const arg = (process.argv.find(a => a.startsWith('--district=')) || '').split('=')[1] || 'all';
  const keys = arg === 'all' ? Object.keys(DISTRICTS) : arg.split(',').map(s => s.trim());
  for (const key of keys) {
    try {
      await processDistrict(key);
    } catch (e) {
      console.error(`Failed ${key}:`, e?.response?.data || e?.message || e);
    }
  }
  console.log('\nDone.');
}

main().catch(e => {
  console.error('Fatal:', e?.response?.data || e?.message || e);
  process.exit(1);
});



