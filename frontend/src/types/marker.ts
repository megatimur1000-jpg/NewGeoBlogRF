// Убираем неиспользуемый импорт
// import { MarkerVisibility } from '../database/entities/Marker.entity';

export interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  address?: string;
  category: string;
  subcategory?: string;
  rating: number;
  rating_count: number;
  photo_urls: string[];
  hashtags: string[];
  is_verified?: boolean;
  creator_id?: string;
  author_name: string;
  created_at: string;
  updated_at: string; // ДОБАВЛЯЕМ ЭТО ПОЛЕ
  likes_count: number;
  comments_count: number;
  shares_count: number;
  visibility?: string;
  marker_type?: 'standard' | 'commercial' | 'promoted';
  
  // Дополнительные поля из БД:
  is_active?: boolean;
  metadata?: any;
  views_count?: number;
  subcategory_id?: string;
  content_id?: string;
  content_type?: string;
  
  // Новые поля для визуальных состояний:
  used_in_blogs?: boolean; // Используется в блогах (золотистая рамка)
  is_user_modified?: boolean; // Отредактировано пользователем (неоновая рамка)
  
  // Полнота заполнения (опционально, разн. наименования с бэка)
  completeness_score?: number;
  completenessScore?: number;
  
  // Гостевой черновик (создан без авторизации)
  is_draft?: boolean;
  
  // Статус модерации
  status?: 'pending' | 'active' | 'rejected' | 'revision' | 'hidden';
  is_pending?: boolean; // Флаг "на модерации" (для обратной совместимости)
} 