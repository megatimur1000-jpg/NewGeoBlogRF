import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/services/gamificationFacade', () => ({
  gamificationFacade: {
    addXP: vi.fn(() => Promise.resolve({ success: true }))
  }
}));

import xpService from '../src/services/xpService';
import { gamificationFacade } from '../src/services/gamificationFacade';

describe('xpService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls gamificationFacade.addXP for track recorded', async () => {
    const res = await xpService.awardTrackRecorded('t1', { distance: 6000, isTracked: true, userId: 'u1' });
    expect((gamificationFacade.addXP as any)).toHaveBeenCalledOnce();
    expect((gamificationFacade.addXP as any).mock.calls[0][0]).toMatchObject({ source: 'gps_track_recorded', contentId: 't1' });
    expect(res).toMatchObject({ success: true });
  });

  it('calls long bonus when awarding separately', async () => {
    await xpService.awardTrackLongBonus('t1', { distance: 7000, userId: 'u1' });
    expect((gamificationFacade.addXP as any)).toHaveBeenCalledOnce();
    expect((gamificationFacade.addXP as any).mock.calls[0][0]).toMatchObject({ source: 'gps_track_long' });
  });

  it('handles errors gracefully', async () => {
    (gamificationFacade.addXP as any).mockImplementationOnce(() => Promise.reject(new Error('boom')));
    const res = await xpService.awardTrackExport('t2', { format: 'gpx', userId: 'u2' });
    expect(res.success).toBe(false);
  });
});
