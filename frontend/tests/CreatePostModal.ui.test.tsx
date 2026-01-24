// @vitest-environment happy-dom
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/contexts/LayoutContext', () => ({ useLayoutState: () => ({}) }));
vi.mock('../src/contexts/FavoritesContext', () => ({ useFavorites: () => ({ favoriteRoutes: [{ id: 'r1', title: 'Route 1', points: [{ coordinates: [55, 37] }, { coordinates: [56, 38] }] }], favoritePlaces: [], favoriteEvents: [] }) }));
vi.mock('../src/services/offlinePostsStorage', () => ({ offlinePostsStorage: { addDraft: vi.fn(() => Promise.resolve()) } }));

import CreatePostModal from '../src/components/Posts/CreatePostModal';
import { offlinePostsStorage } from '../src/services/offlinePostsStorage';

describe('CreatePostModal UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // ensure navigator appears offline so offlineContentQueue.start is not called
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });
    (globalThis as any).alert = vi.fn();
  });

  it('applies initialRoute as hook and saves offline draft', async () => {
    const onClose = vi.fn();
    const onPostCreated = vi.fn();

    render(<CreatePostModal isOpen={true} onClose={onClose} onPostCreated={onPostCreated} initialRoute={{ id: 'r1' }} />);

    // checkbox for hook should be checked because initialRoute sets hasHook
    const checkbox = screen.getByRole('checkbox');
    expect((checkbox as HTMLInputElement).checked).toBe(true);

    // Fill body to satisfy validation
    const textarea = screen.getByPlaceholderText(/Напишите ваш пост/i);
    await userEvent.type(textarea, 'Hello world');

    // Click save offline
    const saveBtn = screen.getByText('Сохранить офлайн');
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(offlinePostsStorage.addDraft).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalled();
    });
  });
});
