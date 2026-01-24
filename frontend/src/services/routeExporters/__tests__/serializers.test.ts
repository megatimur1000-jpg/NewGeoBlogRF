import { describe, it, expect } from 'vitest';
import { toGeoJSON, toGPX, toKML } from '../serializers';

const sampleRoute = {
  id: 'r1',
  points: [
    { lat: 55.75, lon: 37.62, alt: 130.5, ts: '2025-12-28T08:12:34Z' },
    { lat: 55.752, lon: 37.621, ts: '2025-12-28T08:13:00Z' },
  ],
  metadata: { name: 'Тестовый маршрут', description: 'Описание' },
};

describe('route serializers', () => {
  it('toGeoJSON produces LineString', () => {
    const geo = toGeoJSON(sampleRoute as any);
    expect(geo.geometry.type).toBe('LineString');
    expect(Array.isArray(geo.geometry.coordinates)).toBe(true);
    expect(geo.properties.metadata.name).toBeUndefined();
  });

  it('toGPX contains trkpt and timestamps', () => {
    const gpx = toGPX(sampleRoute as any, { includeElevation: true, includeTimestamps: true });
    expect(gpx).toContain('<gpx');
    expect(gpx).toContain('<trkpt lat="55.75" lon="37.62"');
    expect(gpx).toContain('<time>2025-12-28T08:12:34Z</time>');
  });

  it('toKML contains coordinates', () => {
    const kml = toKML(sampleRoute as any);
    expect(kml).toContain('<kml');
    expect(kml).toContain('37.62,55.75,130.5');
  });
});
