// @vitest-environment happy-dom
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const navigateMock = vi.fn();

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

vi.mock('../src/services/routesService', () => ({
  routesService: {
    getMyRoutes: vi.fn(() => Promise.resolve([{ id: 'r1', title: 'Route 1', distance: 1200 }])),
    deleteRoute: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('../src/services/map_facade/index', () => ({
  mapFacade: { exportTrack: vi.fn(() => new Blob(['<gpx/>'], { type: 'application/gpx+xml' })) },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

import ProfileRoutes from '../src/pages/ProfileRoutes';
import { routesService } from '../src/services/routesService';
import { mapFacade } from '../src/services/map_facade/index';

describe('ProfileRoutes UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // mock URL methods used during export
    (global as any).URL.createObjectURL = vi.fn(() => 'blob:fake');
    (global as any).URL.revokeObjectURL = vi.fn();
  });

  it('renders routes and handles export, add-to-post and delete actions', async () => {
    render(<ProfileRoutes />);

    // Wait for route to appear
    expect(await screen.findByText('Route 1')).toBeDefined();

    // Export GPX
    const exportBtn = screen.getByText('Export GPX');
    await userEvent.click(exportBtn);
    expect(mapFacade.exportTrack).toHaveBeenCalledWith(expect.anything(), 'gpx');

    // Add to post should navigate with state
    const addBtn = screen.getByText('Добавить в пост');
    await userEvent.click(addBtn);
    expect(navigateMock).toHaveBeenCalledWith('/posts', { state: { attachRoute: expect.any(Object) } });

    // Delete should remove item from list
    const deleteBtn = screen.getByText('Удалить');
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(routesService.deleteRoute).toHaveBeenCalledWith('r1');
    });
  });

  it('calls export for all supported formats', async () => {
    render(<ProfileRoutes />);

    expect(await screen.findByText('Route 1')).toBeDefined();

    const gpxButtons = screen.getAllByText('Export GPX');
    const kmlButtons = screen.getAllByText('Export KML');
    const geoButtons = screen.getAllByText('Export GeoJSON');

    await userEvent.click(gpxButtons[0]);
    await userEvent.click(kmlButtons[0]);
    await userEvent.click(geoButtons[0]);

    expect(mapFacade.exportTrack).toHaveBeenCalledWith(expect.anything(), 'gpx');
    expect(mapFacade.exportTrack).toHaveBeenCalledWith(expect.anything(), 'kml');
    expect(mapFacade.exportTrack).toHaveBeenCalledWith(expect.anything(), 'geojson');
  });

  it('logs error and keeps item when delete fails', async () => {
    // make deleteRoute throw
    (routesService.deleteRoute as any).mockImplementationOnce(() => Promise.reject(new Error('fail')));
    const spyErr = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ProfileRoutes />);
    expect((await screen.findAllByText('Route 1')).length).toBeGreaterThan(0);

    const deleteBtn = screen.getAllByText('Удалить')[0];
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(routesService.deleteRoute).toHaveBeenCalledWith('r1');
      expect(spyErr).toHaveBeenCalled();
      // item should still be present in case of failure
      expect((screen.getAllByText('Route 1').length)).toBeGreaterThan(0);
    });

    spyErr.mockRestore();
  });
});
