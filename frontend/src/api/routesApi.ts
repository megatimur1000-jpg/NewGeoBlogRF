import apiClient from './apiClient';

export interface ExportOptions {
  includeElevation?: boolean;
  includeTimestamps?: boolean;
  downsampleMeters?: number;
}

const routesApi = {
  getRoute: (id: string) => apiClient.get(`/routes/${id}`),
  listUserRoutes: (userId: string | number, params?: any) => apiClient.get(`/users/${userId}/routes`, { params }),
  createRoute: (payload: any) => apiClient.post('/routes', payload),
  deleteRoute: (id: string) => apiClient.delete(`/routes/${id}`),
  // export: returns blob (file) from server
  exportRoute: (id: string, format: 'gpx' | 'kml' | 'geojson', options?: ExportOptions) =>
    apiClient.post(`/routes/${id}/export`, { format, options }, { responseType: 'blob' as const }),
};

export default routesApi;
