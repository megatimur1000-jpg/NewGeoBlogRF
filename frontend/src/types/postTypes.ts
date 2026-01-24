export interface DraftPost {
  title?: string;
  text: string;
  images?: File[];
  route_id?: string | null;
  marker_id?: string | null;
  event_id?: string | null;
  track?: GeoJSON.Feature<GeoJSON.LineString> | null;
}

export interface PostRef {
  id: string;
  title: string;
  type: 'post';
  status: 'pending' | 'active' | 'rejected' | 'revision' | 'hidden';
}
