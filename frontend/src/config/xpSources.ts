/**
 * Конфигурация источников XP
 * ИСКЛЮЧЕНЫ маршруты для предотвращения накруток
 */

import { XPSourceConfig, XPSource } from '../types/gamification';

export const XP_SOURCES: Record<XPSource, XPSourceConfig> = {
  // === СОЗДАНИЕ КОНТЕНТА ===
  post_created: {
    id: 'post_created',
    name: 'Создание поста',
    description: 'За создание нового поста',
    baseAmount: 50,
    category: 'content',
    requiresModeration: true, // Требует одобрения модератором
    cooldown: 60, // 1 минута между постами
    dailyLimit: 20, // Максимум 20 постов в день
  },
  
  post_with_photo: {
    id: 'post_with_photo',
    name: 'Пост с фото',
    description: 'Бонус за пост с фотографией',
    baseAmount: 25,
    category: 'content',
    requiresModeration: true,
  },
  
  post_with_marker: {
    id: 'post_with_marker',
    name: 'Пост с меткой',
    description: 'Бонус за пост с привязанной меткой',
    baseAmount: 30,
    category: 'content',
    requiresModeration: true,
  },
  
  // === СОЗДАНИЕ МЕТОК ===
  marker_created: {
    id: 'marker_created',
    name: 'Создание метки',
    description: 'За создание новой метки на карте',
    baseAmount: 30,
    category: 'content',
    requiresModeration: true,
    cooldown: 30, // 30 секунд между метками
    dailyLimit: 50, // Максимум 50 меток в день
  },
  
  marker_with_photo: {
    id: 'marker_with_photo',
    name: 'Метка с фото',
    description: 'Бонус за метку с фотографией',
    baseAmount: 20,
    category: 'content',
    requiresModeration: true,
  },
  
  marker_with_description: {
    id: 'marker_with_description',
    name: 'Метка с описанием',
    description: 'Бонус за метку с полным описанием',
    baseAmount: 15,
    category: 'content',
    requiresModeration: true,
  },
  
  // === КАЧЕСТВО КОНТЕНТА ===
  quality_high: {
    id: 'quality_high',
    name: 'Высокое качество',
    description: 'За контент с полнотой >80%',
    baseAmount: 10,
    category: 'quality',
    requiresModeration: true,
  },
  
  quality_perfect: {
    id: 'quality_perfect',
    name: 'Идеальное качество',
    description: 'За контент с полнотой >90% и рейтингом >4.5',
    baseAmount: 30,
    category: 'quality',
    requiresModeration: true,
  },
  
  // === СОЗДАНИЕ СОБЫТИЙ ===
  event_created: {
    id: 'event_created',
    name: 'Создание события',
    description: 'За создание нового события',
    baseAmount: 50,
    category: 'content',
    requiresModeration: true,
    cooldown: 60,
    dailyLimit: 10,
  },
  
  event_with_photo: {
    id: 'event_with_photo',
    name: 'Событие с фото',
    description: 'Бонус за событие с фотографией',
    baseAmount: 25,
    category: 'content',
    requiresModeration: true,
  },
  
  // === СОЗДАНИЕ МАРШРУТОВ ===
  route_created: {
    id: 'route_created',
    name: 'Создание маршрута',
    description: 'За создание нового маршрута',
    baseAmount: 100,
    category: 'content',
    requiresModeration: true,
    cooldown: 300, // 5 минут между маршрутами
    dailyLimit: 5,
  },
  
  route_with_waypoints: {
    id: 'route_with_waypoints',
    name: 'Маршрут с точками',
    description: 'Бонус за маршрут с несколькими точками',
    baseAmount: 30,
    category: 'content',
    requiresModeration: true,
  },
  
  // === СОЗДАНИЕ БЛОГОВ ===
  blog_created: {
    id: 'blog_created',
    name: 'Создание блога',
    description: 'За создание нового блога',
    baseAmount: 75,
    category: 'content',
    requiresModeration: true,
    cooldown: 120,
    dailyLimit: 5,
  },
  
  blog_with_photos: {
    id: 'blog_with_photos',
    name: 'Блог с фото',
    description: 'Бонус за блог с фотографиями',
    baseAmount: 25,
    category: 'content',
    requiresModeration: true,
  },
  
  // === СОЗДАНИЕ КОММЕНТАРИЕВ ===
  comment_created: {
    id: 'comment_created',
    name: 'Создание комментария',
    description: 'За создание комментария',
    baseAmount: 10,
    category: 'content',
    requiresModeration: true,
    cooldown: 10,
    dailyLimit: 50,
  },
  
  // === СОЗДАНИЕ ЧАТОВ ===
  chat_created: {
    id: 'chat_created',
    name: 'Создание чата',
    description: 'За создание чата',
    baseAmount: 5,
    category: 'content',
    requiresModeration: true,
    cooldown: 30,
    dailyLimit: 20,
  },
  
  // === МОДЕРАЦИЯ ===
  content_approved: {
    id: 'content_approved',
    name: 'Одобрение модерацией',
    description: 'Бонус за одобренный модератором контент',
    baseAmount: 20,
    category: 'quality',
    requiresModeration: false, // Это само одобрение
  },
  
  // === ЕЖЕДНЕВНЫЕ ЦЕЛИ ===
  daily_goal_completed: {
    id: 'daily_goal_completed',
    name: 'Выполнение цели',
    description: 'За выполнение ежедневной цели',
    baseAmount: 50, // Базовое значение, может варьироваться
    category: 'activity',
    requiresModeration: false,
  },
  
  daily_goals_all: {
    id: 'daily_goals_all',
    name: 'Все цели выполнены',
    description: 'Бонус за выполнение всех ежедневных целей',
    baseAmount: 0, // Процентный бонус, не фиксированная сумма
    category: 'activity',
    requiresModeration: false,
  },
  
  // === ДОСТИЖЕНИЯ ===
  achievement_unlocked: {
    id: 'achievement_unlocked',
    name: 'Разблокировка достижения',
    description: 'XP за разблокированное достижение',
    baseAmount: 50, // Базовое значение, зависит от редкости
    category: 'achievement',
    requiresModeration: false,
  },

  // === GPS ТРЕКИ ===
  gps_track_recorded: {
    id: 'gps_track_recorded',
    name: 'Запись GPS-трека',
    description: 'Запись GPS-трека пользователем',
    baseAmount: 40,
    category: 'activity',
    requiresModeration: false,
    cooldown: 60 * 5, // 5 минут
    dailyLimit: 5,
  },

  gps_track_long: {
    id: 'gps_track_long',
    name: 'Длинный GPS-трек',
    description: 'Бонус за трек >5 км',
    baseAmount: 20,
    category: 'activity',
    requiresModeration: false,
  },

  gps_track_exported: {
    id: 'gps_track_exported',
    name: 'Экспорт трека',
    description: 'Бонус за экспорт трека в GPX/KML',
    baseAmount: 10,
    category: 'activity',
    requiresModeration: false,
  },
  
  // === СТРИК ===
  streak_bonus: {
    id: 'streak_bonus',
    name: 'Бонус стрика',
    description: 'Множитель XP за активность подряд',
    baseAmount: 0, // Процентный множитель
    category: 'activity',
    requiresModeration: false,
  },
};

// Получить конфигурацию источника XP
export function getXPSourceConfig(source: XPSource): XPSourceConfig {
  return XP_SOURCES[source];
}

// Получить базовое количество XP для источника
export function getBaseXP(source: XPSource): number {
  return XP_SOURCES[source]?.baseAmount || 0;
}

// Проверить, требует ли источник модерации
export function requiresModeration(source: XPSource): boolean {
  return XP_SOURCES[source]?.requiresModeration || false;
}

