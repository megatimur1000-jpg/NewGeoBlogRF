// Node script: fetch restricted zones for Central Federal District (RU-CFO) via Overpass
// Categories: military, aerodromes, protected areas. Converts to simple GeoJSON-like and POSTs to backend /api/zones/import

/* eslint-disable no-console */
const axios = require('axios');

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://z.overpass-api.de/api/interpreter'
];
const BACKEND_IMPORT_URL = process.env.ZONES_IMPORT_URL || 'http://localhost:3002/api/zones/import';

// Rough bbox for Central Federal District (approx): minLon, minLat, maxLon, maxLat
// Covers Moscow and surrounding oblasts; can refine later with exact admin boundary
const CFO_BBOX = [30.0, 52.0, 42.0, 58.5];

function bboxToQuery([minLon, minLat, maxLon, maxLat]) {
  return `${minLat},${minLon},${maxLat},${maxLon}`;
}

function overpassQuery(bbox) {
  const box = bboxToQuery(bbox);
  return `
  [out:json][timeout:90];
  (
    // Military areas
    way["landuse"="military"](${box});
    rel["landuse"="military"](${box});
    way["military"](${box});
    rel["military"](${box});

    // Aerodromes / runways / heliports
    way["aeroway"~"^(aerodrome|runway|helipad|heliport)$"](${box});
    rel["aeroway"~"^(aerodrome|runway|helipad|heliport)$"](${box});

    // Protected areas
    way["boundary"="protected_area"](${box});
    rel["boundary"="protected_area"](${box});
  );
  out body;
  >; // fetch nodes
  out skel qt;
  `;
}

function buildNodesMap(elements) {
  const map = new Map();
  for (const el of elements) {
    if (el.type === 'node') {
      map.set(el.id, [el.lon, el.lat]);
    }
  }
  return map;
}

function assemblePolygons(elements, nodesMap) {
  const polygons = [];
  for (const el of elements) {
    if (el.type === 'way' && Array.isArray(el.nodes) && el.nodes.length >= 3) {
      const coords = el.nodes.map(id => nodesMap.get(id)).filter(Boolean);
      if (coords.length >= 3) {
        // Close ring if not closed
        const first = coords[0];
        const last = coords[coords.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          coords.push(first);
        }
        polygons.push({ coords, tags: el.tags || {} });
      }
    }
    // Relations (multipolygons) can be added later for higher accuracy
  }
  return polygons;
}

function tagToSeverityAndType(tags = {}) {
  if (tags.landuse === 'military' || tags.military) {
    return { severity: 'critical', type: 'military' };
  }
  if (tags.aeroway) {
    return { severity: 'restricted', type: 'aerodrome' };
  }
  if (tags.boundary === 'protected_area') {
    return { severity: 'warning', type: 'protected_area' };
  }
  return { severity: 'restricted', type: 'restricted' };
}

function groupByType(polygons) {
  const groups = new Map();
  for (const p of polygons) {
    const { severity, type } = tagToSeverityAndType(p.tags);
    const name = p.tags?.name || `${type}`;
    const key = `${type}:${severity}`;
    if (!groups.has(key)) {
      groups.set(key, { name, type, severity, polygons: [] });
    }
    groups.get(key).polygons.push(p.coords);
  }
  return Array.from(groups.values());
}

async function fetchOverpass(query) {
  let lastErr;
  for (const url of OVERPASS_ENDPOINTS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { data } = await axios.post(url, query, { headers: { 'Content-Type': 'text/plain; charset=utf-8' }, timeout: 120000 });
        // Overpass sometimes returns HTML error; detect JSON
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

async function main() {
  console.log('Fetching zones for RU-CFO via Overpass (with retries and tiling)...');
  const tiles = splitBBox(CFO_BBOX);
  let allElements = [];
  for (const tile of tiles) {
    const query = overpassQuery(tile);
    const data = await fetchOverpass(query);
    console.log(`Tile returned ${data.elements.length} elements.`);
    allElements = allElements.concat(data.elements);
  }
  console.log(`Total elements: ${allElements.length}`);

  const nodesMap = buildNodesMap(allElements);
  const polygons = assemblePolygons(allElements, nodesMap);
  console.log(`Assembled ${polygons.length} polygons (ways).`);

  const zones = groupByType(polygons);
  console.log(`Prepared ${zones.length} zone groups. Importing to backend...`);

  const payload = { type: 'FeatureCollection', features: zones.map(z => ({ properties: { name: z.name, type: z.type, severity: z.severity }, geometry: { type: 'MultiPolygon', coordinates: z.polygons.map(ring => [ring]) } })) };

  const resp = await axios.post(BACKEND_IMPORT_URL, payload, { headers: { 'Content-Type': 'application/json' } });
  console.log('Import response:', resp.data);
  console.log('Done.');
}

main().catch(err => {
  console.error('Failed:', err?.response?.data || err?.message || err);
  process.exit(1);
});


