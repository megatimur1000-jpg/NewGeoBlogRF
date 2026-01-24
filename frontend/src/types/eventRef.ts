export interface EventRef {
  id: string;
  title: string;
  type: 'event';
  coordinates: {
    lat: number;
    lon: number;
  };
}
