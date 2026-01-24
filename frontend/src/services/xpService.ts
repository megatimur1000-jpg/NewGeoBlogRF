import { gamificationFacade } from './gamificationFacade';
import { XPParams } from '../types/gamification';

/**
 * Высокоуровневый сервис начисления XP.
 * Оборачивает `gamificationFacade` и предоставляет удобные методы
 * для конкретных сценариев (треки, экспорт, посты и т.д.).
 */
export const xpService = {
  async awardTrackRecorded(trackId: string, options: { distance?: number; isTracked?: boolean; userId?: string }) {
    const params: XPParams = {
      userId: options.userId || '',
      source: 'gps_track_recorded',
      amount: 40,
      contentId: trackId,
      contentType: 'route',
      metadata: { distance: options.distance, isTracked: options.isTracked },
    };

    try {
      return await gamificationFacade.addXP(params);
    } catch (e) {
      console.error('xpService.awardTrackRecorded error', e);
      return { success: false, reason: 'error' } as any;
    }
  },

  async awardTrackLongBonus(trackId: string, options: { distance?: number; userId?: string }) {
    const params: XPParams = {
      userId: options.userId || '',
      source: 'gps_track_long',
      amount: 20,
      contentId: trackId,
      contentType: 'route',
      metadata: { distance: options.distance },
    };

    try {
      return await gamificationFacade.addXP(params);
    } catch (e) {
      console.error('xpService.awardTrackLongBonus error', e);
      return { success: false, reason: 'error' } as any;
    }
  },

  async awardTrackExport(trackId: string, options: { format?: 'gpx' | 'kml' | 'geojson'; userId?: string }) {
    const params: XPParams = {
      userId: options.userId || '',
      source: 'gps_track_exported',
      amount: 10,
      contentId: trackId,
      contentType: 'route',
      metadata: { format: options.format as 'gpx' | 'kml' | 'geojson' | undefined },
    };

    try {
      return await gamificationFacade.addXP(params);
    } catch (e) {
      console.error('xpService.awardTrackExport error', e);
      return { success: false, reason: 'error' } as any;
    }
  },

  // Generic wrapper
  async addXP(params: XPParams) {
    try {
      return await gamificationFacade.addXP(params);
    } catch (e) {
      console.error('xpService.addXP error', e);
      return { success: false, reason: 'error' } as any;
    }
  }
};

export default xpService;
