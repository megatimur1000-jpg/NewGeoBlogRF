import { offlineContentQueue } from './offlineContentQueue';
import { storageService } from './storageService';

export const routesService = {
  async getMyRoutes(): Promise<any[]> {
    // try offline queue first
    const drafts = await offlineContentQueue.getDrafts?.('route') ?? [];
    const saved = await storageService.getRoutes?.() ?? [];
    // merge by id, drafts should override saved
    const map = new Map<string, any>();
    saved.forEach((s: any) => map.set(s.id, { ...s }));
    drafts.forEach((d: any) => map.set(d.id, { ...d }));
    return Array.from(map.values());
  },

  async deleteRoute(id: string): Promise<void> {
    await offlineContentQueue.deleteDraft?.('route', id);
    await storageService.deleteRoute?.(id);
  },
};
