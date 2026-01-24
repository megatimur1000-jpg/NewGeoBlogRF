import { describe, it, expect, beforeEach } from 'vitest';
import { routesService } from '../src/services/routesService';
import { offlineContentQueue } from '../src/services/offlineContentQueue';
import { storageService } from '../src/services/storageService';

beforeEach(() => {
  // reset mocks
  (offlineContentQueue as any).getDrafts = undefined;
  (offlineContentQueue as any).deleteDraft = undefined;
  (storageService as any).getRoutes = undefined;
  (storageService as any).deleteRoute = undefined;
});

describe('routesService', () => {
  it('merges drafts and saved routes, drafts take precedence', async () => {
    (offlineContentQueue as any).getDrafts = async (type: string) => {
      if (type === 'route') return [{ id: 'r1', title: 'draft', distance: 1000 }];
      return [];
    };
    (storageService as any).getRoutes = async () => [{ id: 'r1', title: 'saved', distance: 900 }, { id: 'r2', title: 'saved2' }];

    const res = await routesService.getMyRoutes();
    expect(res.find((r: any) => r.id === 'r1')?.title).toBe('draft');
    expect(res.length).toBe(2);
  });

  it('deleteRoute calls offline queue and storage', async () => {
    let deletedFromQueue = false;
    let deletedFromStore = false;
    (offlineContentQueue as any).deleteDraft = async (type: string, id: string) => { if (type === 'route' && id === 'r1') deletedFromQueue = true; };
    (storageService as any).deleteRoute = async (id: string) => { if (id === 'r1') deletedFromStore = true; };

    await routesService.deleteRoute('r1');
    expect(deletedFromQueue).toBe(true);
    expect(deletedFromStore).toBe(true);
  });
});
