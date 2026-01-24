/// <reference types="leaflet" />

import 'leaflet';
import 'leaflet.markercluster';

declare module 'leaflet' {
  export function map(element: HTMLElement | string, options?: MapOptions): Map;
  export function tileLayer(urlTemplate: string, options?: TileLayerOptions): TileLayer;
  export function marker(latLng: LatLngExpression, options?: MarkerOptions): Marker;
  export function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;

  export interface MapOptions {
    center?: LatLngExpression;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    layers?: Layer[];
    zoomControl?: boolean;
    scrollWheelZoom?: boolean;
  }

  export interface TileLayerOptions {
    attribution?: string;
    maxZoom?: number;
  }

  export interface MarkerOptions {
    title?: string;
    icon?: Icon;
  }

  export interface MarkerClusterGroupOptions {
    chunkedLoading?: boolean;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
  }

  export type LatLngExpression = LatLng | [number, number] | { lat: number; lng: number };

  export interface LatLng {
    lat: number;
    lng: number;
  }

  export interface Layer {
    addTo(map: Map): this;
  }

  export interface Map {
    setView(center: LatLngExpression, zoom: number): this;
    addLayer(layer: Layer): this;
    removeLayer(layer: Layer): this;
    invalidateSize(options?: { animate?: boolean; pan?: boolean }): this;
    remove(): void;
    on(event: string, handler: (e: LeafletMouseEvent) => void): void;
    fitBounds(bounds: LatLngBounds, options?: { padding?: [number, number]; maxZoom?: number }): void;
  }

  export interface Marker extends Layer {
    bindPopup(content: string): this;
    bindPopup(content: string | HTMLElement, options?: any): this;
  }

  export interface TileLayer extends Layer {}

  export interface MarkerClusterGroup extends Layer {
    addLayers(layers: Layer[]): this;
    removeLayers(layers: Layer[]): this;
    clearLayers(): this;
    addLayer(layer: Layer): this;
  }

  export interface IconOptions {
    className?: string;
    html?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
  }

  export interface Icon {
    options: IconOptions;
  }

  export interface DivIcon extends Icon {
    options: IconOptions;
  }

  export interface Control {
    Zoom: {
      new(options?: { position?: string }): Control;
    };
  }

  export interface LeafletMouseEvent {
    latlng: LatLng;
  }
} 