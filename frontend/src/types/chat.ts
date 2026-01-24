
export interface User {
  id: string;
  name: string;
  avatar: string | null;
  status: 'online' | 'offline' | 'away';
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  author: User;
  roomId: string;
  timestamp: Date;
  isEdited: boolean;
  replyTo?: Message;
  attachments: string[];
  reactions: Reaction[];
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface Room {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'route' | 'event';
  participants: User[];
  createdAt: Date;
  createdBy: string;
  isArchived: boolean;
  isDeleted?: boolean;
  // Новые поля для маршрутов и событий
  routeId?: string;
  eventId?: string;
  category?: 'general' | 'travel' | 'culture' | 'food' | 'adventure' | 'relaxation' | 'other';
  tags?: string[];
  location?: {
    city: string;
    country: string;
    coordinates?: [number, number];
  };
  startDate?: Date;
  endDate?: Date;
  maxParticipants?: number;
  currentParticipants?: number;
  isActive?: boolean;
}

// Новые типы для маршрутов
export interface RouteRoom extends Room {
  type: 'route';
  routeId: string;
  routeData: {
    title: string;
    description: string;
    waypoints: Array<{
      marker_id: string;
      order_index: number;
    }>;
    totalDistance?: number;
    estimatedDuration?: number;
  };
  participants: User[];
  isActive: boolean;
  canJoin: boolean;
}

// Новые типы для событий
export interface EventRoom extends Room {
  type: 'event';
  eventId: string;
  eventData: {
    title: string;
    description: string;
    location: {
      address: string;
      coordinates: [number, number];
    };
    startDate: Date;
    endDate: Date;
    maxParticipants: number;
    currentParticipants: number;
    category: 'meetup' | 'tour' | 'workshop' | 'party' | 'conference';
    organizer: User;
    price?: number;
    currency?: string;
  };
  participants: User[];
  isActive: boolean;
  canJoin: boolean;
}

// Типы для фильтрации и поиска
export interface RoomFilters {
  type?: 'all' | 'public' | 'private' | 'route' | 'event';
  category?: string;
  location?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  isActive?: boolean;
  canJoin?: boolean;
}

// Типы для создания комнат
export interface CreateRouteRoomData {
  name: string;
  description: string;
  routeId: string;
  routeData: {
    title: string;
    description: string;
    waypoints: Array<{
      marker_id: string;
      order_index: number;
    }>;
  };
  category?: string;
  tags?: string[];
  isPrivate?: boolean;
}

export interface CreateEventRoomData {
  name: string;
  description: string;
  eventData: {
    title: string;
    description: string;
    location: {
      address: string;
      coordinates: [number, number];
    };
    startDate: Date;
    endDate: Date;
    maxParticipants: number;
    currentParticipants: number;
    category: 'meetup' | 'tour' | 'workshop' | 'party' | 'conference';
    organizer: User;
    price?: number;
    currency?: string;
  };
  category?: string;
  tags?: string[];
  isPrivate?: boolean;
}