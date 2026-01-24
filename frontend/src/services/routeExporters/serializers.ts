export type Point = { lat: number; lon: number; alt?: number; ts?: string };

export type Route = {
  id?: string;
  clientId?: string;
  ownerId?: string | number;
  status?: string;
  points: Point[];
  distanceMeters?: number;
  durationMs?: number;
  bbox?: [number, number, number, number];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
};

function escapeXml(s: string | undefined) {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function toGeoJSON(route: Route) {
  const coords = route.points.map((p) => {
    const arr: (number | null)[] = [p.lon, p.lat];
    if (typeof p.alt === 'number') arr.push(p.alt);
    return arr.filter((v) => v !== null) as number[];
  });

  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coords,
    },
    properties: {
      id: route.id ?? null,
      clientId: route.clientId ?? null,
      distanceMeters: route.distanceMeters ?? null,
      durationMs: route.durationMs ?? null,
      metadata: (() => {
        const md = { ...(route.metadata ?? {}) } as Record<string, any>;
        // Do not leak internal name field into geometry properties for tests/clients
        if (md.hasOwnProperty('name')) delete md.name;
        return md;
      })(),
      createdAt: route.createdAt ?? null,
    },
  } as const;
}

export function toGPX(route: Route, options?: { includeElevation?: boolean; includeTimestamps?: boolean }) {
  const includeElevation = options?.includeElevation ?? true;
  const includeTimestamps = options?.includeTimestamps ?? true;

  const name = escapeXml(route.metadata?.name ?? route.id ?? 'route');

  const pointsXml = route.points
    .map((p) => {
      const lat = p.lat;
      const lon = p.lon;
      const ele = typeof p.alt === 'number' && includeElevation ? `<ele>${p.alt}</ele>` : '';
      const time = p.ts && includeTimestamps ? `<time>${escapeXml(p.ts)}</time>` : '';
      return `<trkpt lat="${lat}" lon="${lon}">${ele}${time}</trkpt>`;
    })
    .join('\n');

  const metadata = route.metadata ?? {};

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GeoBlog" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${name}</name>
    <desc>${escapeXml(metadata.description ?? '')}</desc>
  </metadata>
  <trk>
    <name>${name}</name>
    <trkseg>
${pointsXml}
    </trkseg>
  </trk>
</gpx>`;
}

export function toKML(route: Route) {
  const name = escapeXml(route.metadata?.name ?? route.id ?? 'route');
  const coords = route.points
    .map((p) => {
      if (typeof p.alt === 'number') return `${p.lon},${p.lat},${p.alt}`;
      return `${p.lon},${p.lat}`;
    })
    .join(' ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${name}</name>
    <Placemark>
      <name>${name}</name>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>${coords}</coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;
}

export function toGeoJSONFeatureCollection(routes: Route[]) {
  return {
    type: 'FeatureCollection',
    features: routes.map((r) => toGeoJSON(r)),
  };
}

export default {
  toGeoJSON,
  toGeoJSONFeatureCollection,
  toGPX,
  toKML,
};
