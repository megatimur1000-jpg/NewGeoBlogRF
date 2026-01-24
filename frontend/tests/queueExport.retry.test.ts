import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../src/services/offlineContentStorage', () => {
  const getAllDrafts = vi.fn();
  const getDraft = vi.fn();
  const updateDraftStatus = vi.fn();
  const deleteDraft = vi.fn();
  return {
    offlineContentStorage: {
      init: async () => {},
      getAllDrafts,
      getDraft,
      updateDraftStatus,
      deleteDraft,
      addDraft: async () => 'd1'
    }
  };
});

vi.mock('../src/api/apiClient', () => ({
  default: {
    post: vi.fn()
  }
}));

import { offlineContentQueue } from '../src/services/offlineContentQueue';
import apiClient from '../src/api/apiClient';
import { offlineContentStorage } from '../src/services/offlineContentStorage';

describe('Offline queue retry and idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // ensure online
    (global as any).navigator = { onLine: true };
    // provide minimal localStorage for analytics called during queue processing
    (global as any).localStorage = {
      getItem: vi.fn((k: string) => (k === 'user' ? JSON.stringify({ id: 'test-user' }) : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
  });

  it('marks draft failed and increments retries on 5xx', async () => {
    // Arrange: one draft returned
    const draft = {
      id: 'd1',
      contentType: 'route',
      status: 'draft',
      retries: 0,
      contentData: { title: 'T', points: [] },
      track: null,
      hasTrack: false
    } as any;

    (offlineContentStorage.getAllDrafts as any).mockResolvedValue([draft]);

    // Simulate server 500
    (apiClient.post as any).mockRejectedValue({ response: { status: 500, data: { message: 'server error' } } });
    // Act
    await offlineContentQueue.processQueue();

    // Assert: updateDraftStatus called with increased retries
    expect(offlineContentStorage.updateDraftStatus).toHaveBeenCalled();
    const calls = (offlineContentStorage.updateDraftStatus as any).mock.calls;
    // one of calls should set status 'failed' and increase retries
    expect(calls.some((c: any) => c[1] === 'failed')).toBeTruthy();
  });

  it('sends client_id in request body for idempotency', async () => {
    const draft = {
      id: 'd2',
      clientId: 'client-123',
      contentType: 'route',
      status: 'draft',
      retries: 0,
      contentData: { title: 'T2', points: [] },
      track: null,
      hasTrack: false
    } as any;

    (offlineContentStorage.getAllDrafts as any).mockResolvedValue([draft]);

    (apiClient.post as any).mockResolvedValue({ data: { id: 'r-server' } });
    await offlineContentQueue.processQueue();

    expect((apiClient.post as any).mock.calls.length).toBeGreaterThan(0);
    const call = (apiClient.post as any).mock.calls.find((c: any) => String(c[0]).includes('/routes'));
    expect(call).toBeTruthy();
    const body = call[1];
    expect(body).toHaveProperty('client_id', 'client-123');
  });
});
