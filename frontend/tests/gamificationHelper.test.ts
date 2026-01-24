import { describe, it, expect, vi, beforeEach } from 'vitest';

// Мокаем фасад геймификации, который импортируется внутри helper
vi.mock('../src/services/gamificationFacade', () => ({
  gamificationFacade: {
    addXP: vi.fn(() => Promise.resolve(undefined)),
  },
}));

import { addXPForTrack, addXPForTrackExport } from '../src/utils/gamificationHelper';
import { gamificationFacade } from '../src/services/gamificationFacade';

describe('gamificationHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls addXP for track and awards long-track bonus when distance >= 5000m', async () => {
    const trackId = 'track-1';
    await addXPForTrack(trackId, { distance: 6000, isTracked: true, userId: 'user-1' });

    expect(gamificationFacade.addXP).toHaveBeenCalled();
    // первый вызов — базовый
    expect((gamificationFacade.addXP as any).mock.calls[0][0]).toMatchObject({ source: 'gps_track_recorded', amount: 40, contentId: trackId });
    // второй вызов — бонус за длинный трек
    expect((gamificationFacade.addXP as any).mock.calls[1][0]).toMatchObject({ source: 'gps_track_long', amount: 20, contentId: trackId });
  });

  it('does not call addXP when userId is missing for track', async () => {
    await addXPForTrack('t2', { distance: 1000 });
    expect(gamificationFacade.addXP).not.toHaveBeenCalled();
  });

  it('calls addXP for track export', async () => {
    const trackId = 'track-export';
    await addXPForTrackExport(trackId, { userId: 'u2', format: 'gpx' });
    expect(gamificationFacade.addXP).toHaveBeenCalledOnce();
    expect((gamificationFacade.addXP as any).mock.calls[0][0]).toMatchObject({ source: 'gps_track_exported', amount: 10, contentId: trackId });
  });
});
