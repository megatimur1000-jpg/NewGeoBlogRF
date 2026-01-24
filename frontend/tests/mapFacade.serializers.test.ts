import { describe, it, expect } from 'vitest';
import { MapContextFacade } from '../src/services/map_facade/MapContextFacade';

// Minimal dependency mocks
const deps: any = {
  accessControlService: { isPremium: () => true },
  offlineContentQueue: { saveDraft: async () => {} },
  storageService: { saveRoute: async () => {}, getDownloadedRegions: () => [] },
  notificationService: { notify: () => {} },
  gamificationFacade: { recordAction: async () => {} },
  activityService: {},
  eventsStore: {},
  analyticsOrchestrator: {},
  moderationService: {},
  userService: {},
};

describe('MapContextFacade serializers', () => {
  const facade = new MapContextFacade(deps);

  const sampleTrack = {
    id: 't1',
    points: [
      { lat: 55.75, lon: 37.61 },
      { lat: 55.76, lon: 37.62 },
      { lat: 55.77, lon: 37.63 }
    ],
    startTime: new Date('2025-01-01T10:00:00Z'),
    endTime: new Date('2025-01-01T10:30:00Z'),
    distance: 3000,
    duration: 1800000,
  } as any;

  it('toGeoJSON produces LineString with coordinates', () => {
    const geojson = (facade as any).toGeoJSON(sampleTrack);
    expect(geojson.type).toBe('Feature');
    expect(geojson.geometry.type).toBe('LineString');
    expect(geojson.geometry.coordinates.length).toBe(3);
    expect(geojson.properties.distance).toBe(3000);
  });

  it('toGPX includes gpx tags and track points', () => {
    const gpx = (facade as any).toGPX(sampleTrack);
    expect(gpx).toContain('<gpx');
    expect(gpx).toContain('<trkpt');
    expect(gpx).toContain('Tracked route t1');
  });

  it('toKML includes kml and coordinates', () => {
    const kml = (facade as any).toKML(sampleTrack);
    expect(kml).toContain('<kml');
    expect(kml).toContain('<coordinates>');
    expect(kml).toContain('Track t1');
  });
});
