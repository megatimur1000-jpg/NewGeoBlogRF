import { MapContextFacade } from './MapContextFacade';
import type { MapFacadeDependencies, DateRange, CalendarEvent } from './IMapRenderer';

// Реальные сервисы из проекта (если доступны)
import { gamificationFacade } from '../gamificationFacade';
import { offlineContentQueue } from '../offlineContentQueue';
import { activityService } from '../activityService';
import moderationService from '../moderationService';
import { analyticsOrchestrator } from '../../analytics/services/analyticsOrchestrator';
import * as eventService from '../eventService';
import { storageService } from '../storageService';

const defaultDeps: MapFacadeDependencies = {
  accessControlService: { isPremium: () => true },
  storageService: (storageService as any) ?? {
    getDownloadedRegions: () => [],
    // These are synchronous according to MapFacadeDependencies
    addToFavorites: () => { },
    getFavorites: () => [],
    removeFromFavorites: () => { },
    saveRoute: () => { },
    downloadRegion: () => Promise.resolve(),
    deleteRegion: () => Promise.resolve()
  },
  offlineContentQueue: (offlineContentQueue as any) ?? {
    saveDraft: () => Promise.resolve(),
    syncPosts: () => Promise.resolve(),
    getDrafts: () => Promise.resolve([]),
    syncAll: () => Promise.resolve()
  },
  moderationService: (moderationService as any) ?? { submitPost: () => Promise.resolve() },
  eventsStore: {
    getEvents: async (range: DateRange) => {
      const res = await ((eventService as any).getEvents?.() ?? []);
      // best-effort mapping EventData -> CalendarEvent
      return (res as any[]).map((ev: any) => ({
        id: ev.id,
        title: ev.title,
        location: ev.location && typeof ev.location === 'object' && ev.location.coordinates ? { coordinates: ev.location.coordinates } : undefined,
        startAt: ev.startAt,
        ...ev
      })) as CalendarEvent[];
    }
  },
  gamificationFacade: (gamificationFacade as any) ?? {
    recordAction: () => Promise.resolve(),
    isActionRateLimited: () => false
  },
  activityService: (activityService as any) ?? { recordActivity: () => { } },
  analyticsOrchestrator: (analyticsOrchestrator as any) ?? { trackMapInteraction: () => { } },
  notificationService: { notify: () => { } },
  userService: { getCurrentUser: () => ({ id: 'test' }) }
};

let mapFacadeInstance: MapContextFacade | null = null;

export const mapFacade = (() => {
  return () => {
    if (mapFacadeInstance) return mapFacadeInstance;

    try {
      mapFacadeInstance = new MapContextFacade(defaultDeps);
      return mapFacadeInstance;
    } catch (e) {
      console.error('Failed to instantiate MapContextFacade:', e);
      throw e;
    }
  };
})();
export { MapContextFacade } from './MapContextFacade';
export type { MapConfig, MapMarker, Route, RouteStats, Bounds, MapContext, DateRange, GeoPoint, PersistedRoute, UnifiedMarker, MapFacadeDependencies } from './IMapRenderer';

// Ensure exported INTERNAL is the same object attached to the facade instance
((mapFacade as any).INTERNAL) = (mapFacade as any).INTERNAL || {};
export const INTERNAL = (mapFacade as any).INTERNAL;

// Re-export real service so import is actually used (keeps intent clear)
export { offlineService } from '../offlineService';

export default mapFacade;
