export interface PostReaction {
  emoji: string;
  count: number;
  user_reacted: boolean; // Реагировал ли текущий пользователь
  users?: string[]; // Список ID пользователей, которые поставили реакцию (опционально, для модерации)
}

export interface PostDTO {
  id: string;
  title: string;
  body: string;
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  // Реакции эмодзи
  reactions?: PostReaction[];
  route_id?: string;
  marker_id?: string;
  event_id?: string;
  // Дополнительно: список URL фотографий; может приходить как строка с запятыми или массив
  photo_urls?: string | string[];
  // Гостевой черновик (не опубликован на сервере)
  is_draft?: boolean;
  attached_snapshot?: MapSnapshot;
  // Тип контента: 'post' - обычный пост, 'guide' - путеводитель
  content_type?: 'post' | 'guide';
  // Данные конструктора для путеводителей (из блогов)
  constructor_data?: any;
  // Статус модерации
  status?: 'pending' | 'active' | 'rejected' | 'revision' | 'hidden';
}

export interface MapSnapshot {
  id: string;
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]];
  markers: Array<{
    id: string;
    coordinates: [number, number];
    title: string;
    description?: string;
  }>;
  routes: Array<{
    id: string;
    coordinates: [number, number][];
    title: string;
    description?: string;
  }>;
  events: Array<{
    id: string;
    coordinates: [number, number];
    title: string;
    description?: string;
    date: string;
    time?: string;
    location?: string;
  }>;
}
