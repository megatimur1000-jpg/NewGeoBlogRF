import type { IMapRenderer, MapConfig, UnifiedMarker, PersistedRoute, GeoPoint } from '../IMapRenderer';

export class OfflineOSMRenderer implements IMapRenderer {
  async init(containerId: string, config?: MapConfig): Promise<void> { return; }
  renderMarkers(markers: UnifiedMarker[]): void {}
  renderRoute(route: PersistedRoute): void {}
  setView(center: GeoPoint, zoom: number): void {}
  destroy(): void {}
}
