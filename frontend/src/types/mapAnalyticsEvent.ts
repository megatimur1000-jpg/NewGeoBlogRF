export interface MapAnalyticsEvent {
  event_type: string;
  user_id?: string;
  properties: {
    component?: string;
    duration?: number;
    zoom_level?: number;
    action?: string;
    [key: string]: any;
  };
  timestamp?: number;
}
