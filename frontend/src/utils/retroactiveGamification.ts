/**
 * Ретроактивное начисление геймификации
 * 
 * Когда гость регистрируется, начисляем XP и достижения
 * за все его одобренные действия
 */

import { GuestAction, getApprovedGuestActions, clearGuestActions } from '../services/guestActionsService';
import { gamificationFacade } from '../services/gamificationFacade';
import storageService from '../services/storageService';
import { addXPForPost, addXPForMarker } from './gamificationHelper';

export interface RetroactiveResult {
  totalXP: number;
  achievementsUnlocked: number;
  newLevel: number;
  levelUp: boolean;
  actionsProcessed: number;
}

/**
 * Начислить ретроактивный XP и достижения при регистрации
 */
export async function applyRetroactiveGamification(
  guestId: string,
  userId: string
): Promise<RetroactiveResult> {
  const approvedActions = getApprovedGuestActions(guestId);
  
  if (approvedActions.length === 0) {
    return {
      totalXP: 0,
      achievementsUnlocked: 0,
      newLevel: 1,
      levelUp: false,
      actionsProcessed: 0,
    };
  }
  
  let totalXP = 0;
  let achievementsUnlocked = 0;
  
  // Обрабатываем каждое одобренное действие
  for (const action of approvedActions) {
    try {
      if (action.actionType === 'post') {
        // Начисляем XP за пост
        await addXPForPost(action.contentId, {
          hasPhoto: action.metadata?.hasPhoto,
          hasMarker: action.metadata?.hasMarker,
          userId,
        });
        
        // Подсчитываем XP (примерно)
        totalXP += 50; // Базовый XP
        if (action.metadata?.hasPhoto) totalXP += 25;
        if (action.metadata?.hasMarker) totalXP += 30;
        
      } else if (action.actionType === 'marker') {
        // Начисляем XP за метку
        await addXPForMarker(action.contentId, {
          hasPhoto: action.metadata?.hasPhoto,
          hasDescription: action.metadata?.hasDescription,
          completeness: action.metadata?.completeness,
          userId,
        });
        
        // Подсчитываем XP (примерно)
        totalXP += 30; // Базовый XP
        if (action.metadata?.hasPhoto) totalXP += 20;
        if (action.metadata?.hasDescription) totalXP += 15;
        if (action.metadata?.completeness && action.metadata.completeness >= 90) {
          totalXP += 30; // Качество
        }
      }
      
      // TODO: Проверка достижений будет в отдельной функции
      // achievementsUnlocked += await checkAchievementsForAction(userId, action);
      
    } catch (error) {
      console.error(`Failed to process retroactive action ${action.id}:`, error);
    }
  }
  
  // Получаем новый уровень пользователя через API
  let newLevel = 1;
  let levelUp = false;
  
  try {
    const token = storageService.getItem('token');
    if (token) {
      const response = await fetch(`/api/gamification/level/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const levelData = await response.json();
        newLevel = levelData.level || 1;
        levelUp = newLevel > 1; // Если уровень больше 1, значит был level up
      }
    }
  } catch (error) {
    console.error('Failed to fetch user level:', error);
  }
  
  // Проверяем достижения через API (если доступно)
  try {
    const token = storageService.getItem('token');
    if (token && approvedActions.length > 0) {
      // Вызываем API для проверки достижений
      const achievementsResponse = await fetch('/api/gamification/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json();
        achievementsUnlocked = achievementsData.achievements?.filter((a: any) => a.unlocked).length || 0;
      }
    }
  } catch (error) {
    console.warn('Failed to check achievements:', error);
  }
  
  // Очищаем действия гостя после обработки
  clearGuestActions(guestId);
  
  return {
    totalXP,
    achievementsUnlocked,
    newLevel,
    levelUp,
    actionsProcessed: approvedActions.length,
  };
}

/**
 * Получить статистику для приветственного окна
 */
export function getWelcomeStats(approvedActions: GuestAction[]): {
  postsCount: number;
  markersCount: number;
  routesCount: number;
  totalActions: number;
} {
  return {
    postsCount: approvedActions.filter(a => a.actionType === 'post').length,
    markersCount: approvedActions.filter(a => a.actionType === 'marker').length,
    routesCount: approvedActions.filter(a => a.actionType === 'route').length,
    totalActions: approvedActions.length,
  };
}

