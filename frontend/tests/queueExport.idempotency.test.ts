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

describe('Offline queue idempotency handling', () => {
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

  it('treats 409 duplicate response as success and deletes draft', async () => {
    const draft = {
      id: 'd-dup',
      clientId: 'client-dup-1',
      contentType: 'route',
      status: 'draft',
      retries: 0,
      contentData: { title: 'Dup', points: [] },
      track: null,
      hasTrack: false
    } as any;

    (offlineContentStorage.getAllDrafts as any).mockResolvedValue([draft]);

    // Simulate server 409 conflict due to duplicate
    (apiClient.post as any).mockRejectedValue({ response: { status: 409, data: { message: 'duplicate' } } });

    await offlineContentQueue.processQueue();

    expect(offlineContentStorage.deleteDraft).toHaveBeenCalledWith('d-dup');
  });
});
