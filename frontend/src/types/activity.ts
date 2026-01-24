
export type ActivityType = 'message' | 'join' | 'room_created' | 'user_promoted' | 'system';

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  user: User;
  timestamp: Date;
  isRead: boolean;
  content?: string;
  roomName?: string;
  roomType?: 'public' | 'private';
  targetUser?: User;
  newRole?: string;
  category?: string;
}

export interface ActivityFilters {
  type?: ActivityType;
  timeRange?: 'today' | 'week' | 'month';
  category?: string;
}

export interface ActivityCounts {
  total: number;
  unread: number;
  byType: Record<ActivityType, number>;
}