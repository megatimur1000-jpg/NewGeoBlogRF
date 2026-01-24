import { describe, it, expect } from 'vitest';
import serializers from '../src/services/routeExporters/serializers';

describe('GPX/KML serializers', () => {
  const route = {
    id: 'r1',
    clientId: 'c1',
    points: [
      { lat: 55.0, lon: 37.0, alt: 100, ts: '2025-01-01T10:00:00Z' },
      { lat: 55.1, lon: 37.1, alt: 110, ts: '2025-01-01T10:05:00Z' }
    ],
    metadata: { name: 'Test Route', description: 'Desc' }
  } as any;

  it('generates valid GPX with elevation and timestamps by default', () => {
    const gpx = serializers.toGPX(route);
    expect(gpx).toContain('<?xml');
    expect(gpx).toContain('<gpx');
    expect(gpx).toContain('<trkseg>');
    // two track points
    const trkptMatches = gpx.match(/<trkpt /g) || [];
    expect(trkptMatches.length).toBe(2);
    // elevation and time present
    expect(gpx).toContain('<ele>100</ele>');
    expect(gpx).toContain('<time>2025-01-01T10:00:00Z</time>');
  });

  it('can omit elevation or timestamps via options', () => {
    const gpxNoEle = serializers.toGPX(route, { includeElevation: false, includeTimestamps: true });
    expect(gpxNoEle).not.toContain('<ele>');
    expect(gpxNoEle).toContain('<time>2025-01-01T10:00:00Z</time>');

    const gpxNoTime = serializers.toGPX(route, { includeElevation: true, includeTimestamps: false });
    expect(gpxNoTime).toContain('<ele>100</ele>');
    expect(gpxNoTime).not.toContain('<time>2025-01-01T10:00:00Z</time>');
  });

  it('generates valid KML with LineString coordinates', () => {
    const kml = serializers.toKML(route);
    expect(kml).toContain('<?xml');
    expect(kml).toContain('<kml');
    expect(kml).toContain('<LineString>');
    expect(kml).toContain('<coordinates>');
    // coordinates include lon,lat,alt entries
    expect(kml).toContain('37,55,100');
    expect(kml).toContain('37.1,55.1,110');
  });
});
