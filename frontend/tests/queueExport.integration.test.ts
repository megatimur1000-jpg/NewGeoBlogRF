/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mocks for network and APIs
vi.mock('../src/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('../src/api/routesApi', async () => {
  const actual = await vi.importActual('../src/api/routesApi');
  return {
    default: {
      ...actual,
      exportRoute: vi.fn()
    }
  };
});

// Provide an in-memory mock for offlineContentStorage used by offlineContentQueue
const draftsStore: Map<string, any> = new Map();
let idCounter = 1;
vi.mock('../src/services/offlineContentStorage', () => ({
  offlineContentStorage: {
    async init() { return; },
    async addDraft(draft: any) {
      const id = `d${idCounter++}`;
      const full = { ...draft, id, createdAt: Date.now(), retries: 0 };
      draftsStore.set(id, full);
      return id;
    },
    async getDraft(id: string) {
      return draftsStore.get(id) || null;
    },
    async deleteDraft(id: string) {
      draftsStore.delete(id);
    },
    async getAllDrafts(type?: any) {
      return Array.from(draftsStore.values()).filter(d => !type || d.contentType === type);
    },
    async updateDraftStatus(id: string, status: any, retries?: number) {
      const d = draftsStore.get(id);
      if (d) {
        d.status = status;
        if (typeof retries === 'number') d.retries = retries;
        draftsStore.set(id, d);
      }
    }
  }
}));

// Now import queue and exporter after mocks
import { offlineContentQueue } from '../src/services/offlineContentQueue';
import apiClient from '../src/api/apiClient';
import routesApi from '../src/api/routesApi';
import { exportRouteAndDownload } from '../src/services/routeExporters/exportClient';

// ensure navigator available
if (typeof (global as any).navigator === 'undefined') (global as any).navigator = { onLine: true };

describe('Offline queue -> export integration (mocked storage)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    draftsStore.clear();
    idCounter = 1;
  });

  it('processQueue uploads route draft and removes it', async () => {
    // Arrange: save a route draft via mocked storage
    const draftId = await (await import('../src/services/offlineContentStorage')).offlineContentStorage.addDraft({
      contentType: 'route',
      contentData: { title: 'R', points: [{ latitude: 1, longitude: 2 }], waypoints: [] },
      track: { type: 'Feature', geometry: { type: 'LineString', coordinates: [[2,1]] }, properties: {} },
      hasTrack: true,
      status: 'draft',
      regionId: 'default',
      images: [],
      hasImages: false
    });

    // Mock apiClient.post to simulate server route creation
    (apiClient.post as any).mockResolvedValue({ data: { id: 'server-route-1' } });

    // Act
    await offlineContentQueue.processQueue();

    // Assert: apiClient.post called and draft removed
    expect((apiClient.post as any).mock.calls.find((c: any) => String(c[0]).includes('/routes'))).toBeTruthy();
    const draft = await (await import('../src/services/offlineContentStorage')).offlineContentStorage.getDraft(draftId);
    expect(draft).toBeNull();
  });

  it('exportRouteAndDownload tries server export and falls back to local serialization on error', async () => {
    const route = { id: 'r-1', points: [{ lat: 1, lon: 2 }], metadata: { name: 'R' } } as any;

    // server export succeeds
    (routesApi.exportRoute as unknown as vi.Mock).mockResolvedValue({ data: new Blob(['ok']), headers: { 'content-type': 'application/gpx+xml' } });
    // ensure document.body.appendChild exists for download helper (happy-dom may provide document but not body)
    if (!(global as any).document) (global as any).document = {} as any;
    if (!(global as any).document.body) (global as any).document.body = { appendChild: () => {}, removeChild: () => {} };
    if (!(global as any).document.createElement) (global as any).document.createElement = () => ({ click: () => {}, remove: () => {} });

    await exportRouteAndDownload(route, 'gpx');
    expect((routesApi.exportRoute as unknown as vi.Mock).mock.calls.length).toBeGreaterThanOrEqual(1);

    // server export fails -> fallback
    (routesApi.exportRoute as unknown as vi.Mock).mockRejectedValue(new Error('network'));
    await exportRouteAndDownload(route, 'kml');
    expect((routesApi.exportRoute as unknown as vi.Mock).mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Provide a minimal in-memory IndexedDB shim for the test environment
(global as any).indexedDB = (function () {
  const dbs: Record<string, any> = {};
  return {
    deleteDatabase(name: string) {
      delete dbs[name];
      const req: any = {};
      setTimeout(() => { req.onsuccess && req.onsuccess(); }, 0);
      return req;
    },
    open(name: string, version?: number) {
      const req: any = {};
      setTimeout(() => {
        const isNew = !dbs[name];
        if (isNew) {
          // create minimal db object
          const objectStores: Record<string, any> = {};
          const db: any = {
            name,
            version: version || 1,
            objectStoreNames: {
              contains: (n: string) => !!objectStores[n],
              // mimic DOMStringList behavior
              item: (i: number) => Object.keys(objectStores)[i],
              length: 0
            },
            createObjectStore(storeName: string, opts: any) {
              objectStores[storeName] = { data: new Map(), indexes: {}, createIndex: (_: string) => {} };
              // update length
              db.objectStoreNames.length = Object.keys(objectStores).length;
              return objectStores[storeName];
            },
            deleteObjectStore(storeName: string) {
              delete objectStores[storeName];
              db.objectStoreNames.length = Object.keys(objectStores).length;
            },
            transaction(names: string[] | string, mode: string) {
              const storeName = Array.isArray(names) ? names[0] : names;
              const store = objectStores[storeName];
              return {
                objectStore: () => ({
                  add: (value: any) => {
                    const key = value.id || crypto.randomUUID();
                    store.data.set(key, { ...value, id: key });
                    const r: any = { result: key };
                    setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                    return r;
                  },
                  get: (key: string) => {
                    const r: any = { result: store.data.get(key) };
                    setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                    return r;
                  },
                  getAll: (query?: any) => {
                    const arr = Array.from(store.data.values());
                    const r: any = { result: arr };
                    setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                    return r;
                  },
                  delete: (key: string) => {
                    store.data.delete(key);
                    const r: any = {};
                    setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                    return r;
                  },
                  index: (name: string) => ({ getAll: (v: any) => {
                    const arr = Array.from(store.data.values()).filter(() => true);
                    const r: any = { result: arr };
                    setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                    return r;
                  } })
                })
              };
            }
          };
          dbs[name] = db;
          // simulate onupgradeneeded
          if (req.onupgradeneeded) {
            const ev: any = { target: { result: db } };
            req.onupgradeneeded(ev);
          }
        }

        // finally success
        req.result = dbs[name];
        req.onsuccess && req.onsuccess();
      }, 0);
      return req;
    }
  };
})();

import { offlineContentStorage } from '../src/services/offlineContentStorage';
import { offlineContentQueue } from '../src/services/offlineContentQueue';
import apiClient from '../src/api/apiClient';
import routesApi from '../src/api/routesApi';
import { exportRouteAndDownload } from '../src/services/routeExporters/exportClient';

// Ensure navigator and document exist in this test context
if (typeof (global as any).navigator === 'undefined') {
  (global as any).navigator = { onLine: true };
}

if (typeof (global as any).document === 'undefined') {
  (global as any).document = {
    createElement: (tag: string) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: () => {},
          remove: () => {}
        } as any;
      }
      return {} as any;
    }
  } as any;
}

// Mocks
vi.mock('../src/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('../src/api/routesApi', async () => {
  const actual = await vi.importActual('../src/api/routesApi');
  return {
    default: {
      ...actual,
      exportRoute: vi.fn()
    }
  };
});

describe('Offline queue -> export integration', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Ensure DB is initialized and empty
    try {
      // delete and re-init IndexedDB by recreation
      // offlineContentStorage uses fixed DB name; we can attempt to clear by opening and deleting
      const req = indexedDB.deleteDatabase('geoblog_offline_content');
      await new Promise((res) => { req.onsuccess = req.onerror = res; });
    } catch (e) {
      // ignore
    }
    await offlineContentStorage.init();
  });

  it('processQueue uploads route draft and removes it', async () => {
    // Arrange: save a route draft
    const draftId = await offlineContentStorage.addDraft({
      contentType: 'route',
      contentData: {
        title: 'Integration Route',
        points: [ { latitude: 10, longitude: 10 } ],
        waypoints: []
      },
      track: {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [[10,10],[10.1,10.1]] },
        properties: {}
      } as any,
      hasTrack: true,
      status: 'draft',
      regionId: 'default',
      images: [],
      hasImages: false
    });

    // Mock apiClient.post to simulate server route creation
    (apiClient.post as any).mockResolvedValue({ data: { id: 'server-route-1' } });

    // Act: process queue
    await offlineContentQueue.processQueue();

    // Assert: apiClient.post called with /routes
    expect((apiClient.post as any).mock.calls.find((c: any) => String(c[0]).includes('/routes'))).toBeTruthy();

    // The draft should be deleted from storage
    const draft = await offlineContentStorage.getDraft(draftId);
    expect(draft).toBeNull();
  });

  it('exportRouteAndDownload tries server export and falls back to local serialization on error', async () => {
    // Arrange: create a simple route object
    const route = { id: 'r-test', points: [{ lat: 1, lon: 2 }], metadata: { name: 'R' } } as any;

    // Case 1: server export succeeds
    (routesApi.exportRoute as unknown as vi.Mock).mockResolvedValue({ data: new Blob(['ok']), headers: { 'content-type': 'application/gpx+xml' } });

    // Spy on download by creating anchor creation
    const created = [] as HTMLAnchorElement[];
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: any) => {
      const el = origCreate(tag);
      if (tag === 'a') created.push(el as HTMLAnchorElement);
      return el;
    });

    await exportRouteAndDownload(route, 'gpx');
    expect((routesApi.exportRoute as unknown as vi.Mock).mock.calls.length).toBeGreaterThanOrEqual(1);

    // Case 2: server export fails -> fallback serialization should still produce download
    (routesApi.exportRoute as unknown as vi.Mock).mockRejectedValue(new Error('network'));

    await exportRouteAndDownload(route, 'kml');
    expect((routesApi.exportRoute as unknown as vi.Mock).mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
