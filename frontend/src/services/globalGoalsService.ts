/**
 * Сервис для работы с глобальными целями сообщества
 */

import apiClient from '../api/apiClient';
import { GlobalGoalsResponse } from '../types/globalGoals';

/**
 * Получить все активные глобальные цели
 */
export const getGlobalGoals = async (): Promise<GlobalGoalsResponse> => {
  try {
    const response = await apiClient.get('/gamification/global/global-goals');
    return response.data;
  } catch (error) {
    console.error('getGlobalGoals error:', error);
    return {
      goals: [],
      total: 0,
      active: 0,
    };
  }
};

/**
 * Обновить прогресс глобальной цели
 */
export const updateGlobalGoalProgress = async (
  goalId: string,
  actionType: 'post' | 'marker' | 'route',
  amount: number = 1
): Promise<void> => {
  try {
    await apiClient.post(`/gamification/global/global-goals/${goalId}/progress`, {
      actionType,
      amount,
    });
  } catch (error) {
    console.error('updateGlobalGoalProgress error:', error);
  }
};

/**
 * Получить статистику глобальных целей
 */
export const getGlobalGoalsStats = async () => {
  try {
    const response = await apiClient.get('/gamification/global/global-goals/stats');
    return response.data;
  } catch (error) {
    console.error('getGlobalGoalsStats error:', error);
    return null;
  }
};

