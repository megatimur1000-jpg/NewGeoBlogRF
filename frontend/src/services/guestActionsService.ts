/**
 * Сервис для отслеживания действий гостей
 * 
 * Отслеживает действия гостей до регистрации:
 * - Создание постов
 * - Создание меток
 * - Отправка на модерацию
 * - Одобрение модерацией
 * 
 * При регистрации все одобренные действия используются
 * для ретроактивного начисления XP и достижений
 */

export interface GuestAction {
  id: string;
  guestId: string;              // ID гостевой сессии
  actionType: 'post' | 'marker' | 'route';
  contentId: string;            // ID контента (может быть draft ID)
  contentData?: any;             // Данные контента для ретроактивного начисления
  createdAt: string;            // Когда создано
  submittedAt?: string;          // Когда отправлено на модерацию
  moderatedAt?: string;          // Когда одобрено/отклонено
  approved: boolean;             // Одобрено ли модерацией
  moderationStatus: 'pending' | 'approved' | 'rejected';
  
  // Данные для ретроактивного начисления XP
  metadata?: {
    hasPhoto?: boolean;
    hasMarker?: boolean;
    hasDescription?: boolean;
    completeness?: number;
    quality?: 'low' | 'medium' | 'high' | 'perfect';
  };
}

const STORAGE_KEY = 'geoblog_guest_actions_v1';
import storageService from './storageService';

/**
 * Получить ID гостевой сессии
 */
export function getGuestId(): string {
  const guestData = storageService.getItem('guest_session_data');
  if (guestData) {
    try {
      const parsed = JSON.parse(guestData);
      return parsed.sessionId || `guest_${Date.now()}`;
    } catch {
      return `guest_${Date.now()}`;
    }
  }
  return `guest_${Date.now()}`;
}

/**
 * Загрузить все действия гостя
 */
function loadGuestActions(): GuestAction[] {
  try {
    const raw = storageService.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Сохранить действия гостя
 */
function saveGuestActions(actions: GuestAction[]): void {
  try {
    storageService.setItem(STORAGE_KEY, JSON.stringify(actions));
  } catch (error) {
    console.error('Failed to save guest actions:', error);
  }
}

/**
 * Записать действие гостя (при создании контента)
 */
export function recordGuestAction(action: Omit<GuestAction, 'id' | 'guestId' | 'createdAt' | 'moderationStatus'>): GuestAction {
  const guestId = getGuestId();
  const actions = loadGuestActions();
  
  const newAction: GuestAction = {
    id: `action_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    guestId,
    createdAt: new Date().toISOString(),
    moderationStatus: 'pending',
    ...action,
  };
  
  actions.push(newAction);
  saveGuestActions(actions);
  
  return newAction;
}

/**
 * Отметить действие как отправленное на модерацию
 */
export function markActionAsSubmitted(contentId: string, actionType: 'post' | 'marker' | 'route'): void {
  const guestId = getGuestId();
  const actions = loadGuestActions();
  
  const action = actions.find(
    a => a.guestId === guestId && 
         a.contentId === contentId && 
         a.actionType === actionType
  );
  
  if (action) {
    action.submittedAt = new Date().toISOString();
    action.moderationStatus = 'pending';
    saveGuestActions(actions);
  }
}

/**
 * Отметить действие как одобренное модерацией
 * Вызывается когда модератор одобряет контент
 */
export function markActionAsApproved(contentId: string, actionType: 'post' | 'marker' | 'route'): void {
  const actions = loadGuestActions();
  
  const action = actions.find(
    a => a.contentId === contentId && a.actionType === actionType
  );
  
  if (action) {
    action.approved = true;
    action.moderatedAt = new Date().toISOString();
    action.moderationStatus = 'approved';
    saveGuestActions(actions);
  }
}

/**
 * Получить все одобренные действия гостя
 */
export function getApprovedGuestActions(guestId: string): GuestAction[] {
  const actions = loadGuestActions();
  return actions.filter(
    a => a.guestId === guestId && a.approved === true
  );
}

/**
 * Получить все действия гостя (для отображения)
 */
export function getAllGuestActions(guestId?: string): GuestAction[] {
  const actions = loadGuestActions();
  const targetGuestId = guestId || getGuestId();
  return actions.filter(a => a.guestId === targetGuestId);
}

/**
 * Очистить действия гостя (после ретроактивного начисления)
 */
export function clearGuestActions(guestId: string): void {
  const actions = loadGuestActions();
  const filtered = actions.filter(a => a.guestId !== guestId);
  saveGuestActions(filtered);
}

/**
 * Получить статистику действий гостя
 */
export function getGuestActionsStats(guestId?: string): {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  byType: {
    posts: number;
    markers: number;
    routes: number;
  };
} {
  const actions = getAllGuestActions(guestId);
  
  return {
    total: actions.length,
    approved: actions.filter(a => a.approved).length,
    pending: actions.filter(a => a.moderationStatus === 'pending').length,
    rejected: actions.filter(a => a.moderationStatus === 'rejected').length,
    byType: {
      posts: actions.filter(a => a.actionType === 'post').length,
      markers: actions.filter(a => a.actionType === 'marker').length,
      routes: actions.filter(a => a.actionType === 'route').length,
    },
  };
}

