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

describe('Offline queue backoff on 5xx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).navigator = { onLine: true };
    (global as any).localStorage = {
      getItem: vi.fn((k: string) => (k === 'user' ? JSON.stringify({ id: 'test-user' }) : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
  });

  it('schedules retry with expected delay for 5xx', async () => {
    vi.useFakeTimers();

    const draft = {
      id: 'd-backoff',
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

    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    await offlineContentQueue.processQueue();

    // updateDraftStatus should be called with increased retries and 'failed'
    expect(offlineContentStorage.updateDraftStatus).toHaveBeenCalled();
    const calls = (offlineContentStorage.updateDraftStatus as any).mock.calls;
    expect(calls.some((c: any) => c[1] === 'failed' && c[2] === 1)).toBeTruthy();

    // Should schedule a retry with 60 seconds delay for first retry
    const has60s = setTimeoutSpy.mock.calls.some((c: any) => c[1] === 60 * 1000);
    expect(has60s).toBeTruthy();

    vi.useRealTimers();
  });
});
