export interface EventParticipant {
  organizer: string;
  members: string[];
  maxCapacity: number;
  joinRequests: string[];
}

export interface EventIntegrations {
  routeId: string | null;
  chatRoomId: string | null;
  mapMarkerId: string | null;
  blogId: string | null;
}

export interface EventMetadata {
  budget: number;
  difficulty: string;
  tags: string[];
}

export interface EventLocation {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface EventType {
  id: string;
  title: string;
  description: string;
  dateRange: {
    start: string;
    end: string;
  };
  location: EventLocation;
  status: 'active' | 'cancelled' | 'pending' | 'planning' | 'completed' | 'archived';
  isFavorite?: boolean;
  participants: EventParticipant;
  category?: string;
  tags?: string[];
  integrations: EventIntegrations;
  metadata: EventMetadata;
  preparationProgress: number;
  hasRecentActivity: boolean;
  createdAt: string;
}

export interface Participants {
  organizer: string;
  members: string[];
  maxCapacity: number;
  joinRequests: string[];
}

export interface EventData {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  start_datetime?: string; // Альтернативное поле для даты/времени
  end_datetime?: string;
  location?: string | EventLocation; // Может быть строкой или объектом
  category?: string;
  event_type?: string;
  is_public?: boolean;
  creator_id?: string;
  creator_name?: string; // Имя создателя (из JOIN)
  hashtags?: string[];
  is_user_modified?: boolean;
  used_in_blogs?: boolean;
  created_at: string;
  updated_at?: string;
  // Поля для фото
  cover_image_url?: string;
  image_url?: string;
  photo_urls?: string | string[]; // Может быть строкой (CSV/JSON) или массивом
  // Дополнительные поля
  status?: 'pending' | 'active' | 'rejected' | 'hidden' | 'draft';
  moderation_reason?: string;
  latitude?: number;
  longitude?: number;
}