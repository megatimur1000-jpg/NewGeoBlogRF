/**
 * Фасад геймификации - единая точка входа для всех действий геймификации
 * 
 * Обеспечивает:
 * - Проверку модерации
 * - Защиту от накруток (проверка уникальности)
 * - Лимиты и кулердауны
 * - Интеграцию с Backend API
 * 
 * ИСКЛЮЧЕНЫ маршруты для предотвращения накруток
 */

import { XPParams, XPResult, UserLevel, XPSource } from '../types/gamification';
import { getXPSourceConfig, getBaseXP, requiresModeration } from '../config/xpSources';
import { 
  calculateFinalXP, 
  calculateNewLevel, 
  createUserLevelFromTotalXP,
  shouldLevelUp 
} from '../utils/xpCalculator';
import apiClient from '../api/apiClient';

// История действий для проверки уникальности
interface ActionHistory {
  userId: string;
  source: XPSource;
  contentId?: string;
  timestamp: number;
}

class GamificationFacade {
  private actionHistory: Map<string, ActionHistory[]> = new Map();
  private dailyLimits: Map<string, Map<XPSource, number>> = new Map();
  private lastActionTime: Map<string, Map<XPSource, number>> = new Map();
  
  /**
   * Добавить XP пользователю
   * Проверяет модерацию, уникальность, лимиты
   */
  async addXP(params: XPParams): Promise<XPResult> {
    try {
      // Проверка 1: Валидация параметров
      if (!params.userId || !params.source || params.amount <= 0) {
        return { success: false, reason: 'invalid' };
      }
      
      // Проверка 2: Модерация (если требуется)
      if (requiresModeration(params.source) && params.contentId) {
        const isModerated = await this.checkModeration(params.contentId, params.contentType);
        if (!isModerated) {
          return { success: false, reason: 'not_moderated' };
        }
      }
      
      // Проверка 3: Уникальность действия
      if (this.isDuplicateAction(params.userId, params.source, params.contentId)) {
        return { success: false, reason: 'duplicate' };
      }
      
      // Проверка 4: Кулердаун
      const config = getXPSourceConfig(params.source);
      if (config.cooldown) {
        const lastAction = this.getLastActionTime(params.userId, params.source);
        const now = Date.now();
        if (lastAction && (now - lastAction) < config.cooldown * 1000) {
          return { success: false, reason: 'cooldown' };
        }
      }
      
      // Проверка 5: Дневной лимит
      if (config.dailyLimit) {
        const todayCount = this.getTodayActionCount(params.userId, params.source);
        if (todayCount >= config.dailyLimit) {
          return { success: false, reason: 'limit_exceeded' };
        }
      }
      
      // Получить текущий уровень пользователя
      const currentLevel = await this.getUserLevel(params.userId);
      
      // Рассчитать итоговый XP с множителями
      const multipliers = await this.getMultipliers(params.userId);
      const finalXP = calculateFinalXP(params.amount, multipliers);
      
      // Проверить, нужно ли повышать уровень
      const levelUp = shouldLevelUp(
        currentLevel.currentXP,
        currentLevel.requiredXP,
        finalXP
      );
      
      // Рассчитать новый уровень
      const { newLevel, newLevelXP } = calculateNewLevel(
        currentLevel.level,
        currentLevel.currentXP,
        currentLevel.requiredXP,
        finalXP
      );
      
      // Отправить на бэкенд
      const response = await apiClient.post('/gamification/xp', {
        userId: params.userId,
        source: params.source,
        amount: finalXP,
        contentId: params.contentId,
        metadata: params.metadata,
      });
      
      // Обновить историю действий
      this.recordAction(params.userId, params.source, params.contentId);
      this.updateDailyLimit(params.userId, params.source);
      this.updateLastActionTime(params.userId, params.source);
      
      // Вернуть результат
      return {
        success: true,
        newLevel: levelUp ? newLevel : currentLevel.level,
        levelUp,
        totalXP: currentLevel.totalXP + finalXP,
        currentLevelXP: levelUp ? newLevelXP : currentLevel.currentXP + finalXP,
        requiredXP: levelUp ? this.calculateRequiredXP(newLevel) : currentLevel.requiredXP,
      };
      
    } catch (error: any) {
      console.error('GamificationFacade.addXP error:', error);
      return { success: false, reason: 'invalid' };
    }
  }
  
  /**
   * Проверить, одобрен ли контент модератором
   */
  private async checkModeration(contentId: string, contentType?: string): Promise<boolean> {
    try {
      // Вызов API модерации
      const response = await apiClient.get(`/moderation/check/${contentId}`, {
        params: { type: contentType },
      });
      return response.data?.approved === true;
    } catch (error) {
      console.error('GamificationFacade.checkModeration error:', error);
      // По умолчанию считаем, что не одобрено (безопаснее)
      return false;
    }
  }
  
  /**
   * Проверить, не является ли действие дубликатом
   */
  private isDuplicateAction(userId: string, source: XPSource, contentId?: string): boolean {
    const key = `${userId}_${source}`;
    const history = this.actionHistory.get(key) || [];
    
    if (!contentId) {
      // Для действий без contentId проверяем по времени (кулердаун)
      return false;
    }
    
    // Проверяем, было ли уже это действие для этого контента
    return history.some(action => action.contentId === contentId);
  }
  
  /**
   * Записать действие в историю
   */
  private recordAction(userId: string, source: XPSource, contentId?: string): void {
    const key = `${userId}_${source}`;
    const history = this.actionHistory.get(key) || [];
    
    history.push({
      userId,
      source,
      contentId,
      timestamp: Date.now(),
    });
    
    // Очистить старые записи (старше 24 часов)
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const filtered = history.filter(action => action.timestamp > dayAgo);
    
    this.actionHistory.set(key, filtered);
  }
  
  /**
   * Получить текущий уровень пользователя
   * Публичный метод для использования в других сервисах
   */
  async getUserLevel(userId: string): Promise<UserLevel> {
    try {
      const response = await apiClient.get(`/gamification/level/${userId}`);
      const data = response.data;
      
      // Если API вернул полные данные уровня, используем их
      if (data.level !== undefined) {
        return {
          level: data.level,
          currentXP: data.currentXP || 0,
          requiredXP: data.requiredXP || 100,
          totalXP: data.totalXP || 0,
          rank: data.rank || 'novice',
          progress: data.progress || 0,
        };
      }
      
      // Иначе рассчитываем из totalXP
      return createUserLevelFromTotalXP(data.totalXP || 0);
    } catch (error) {
      console.error('GamificationFacade.getUserLevel error:', error);
      // Возвращаем начальный уровень
      return createUserLevelFromTotalXP(0);
    }
  }
  
  /**
   * Получить множители XP (стрик, качество и т.д.)
   */
  private async getMultipliers(userId: string): Promise<{
    streak?: number;
    quality?: number;
    bonus?: number;
  }> {
    try {
      const response = await apiClient.get(`/gamification/multipliers/${userId}`);
      return response.data || {};
    } catch (error) {
      console.error('GamificationFacade.getMultipliers error:', error);
      return {};
    }
  }
  
  /**
   * Получить время последнего действия
   */
  private getLastActionTime(userId: string, source: XPSource): number | null {
    const userActions = this.lastActionTime.get(userId);
    if (!userActions) return null;
    return userActions.get(source) || null;
  }
  
  /**
   * Обновить время последнего действия
   */
  private updateLastActionTime(userId: string, source: XPSource): void {
    let userActions = this.lastActionTime.get(userId);
    if (!userActions) {
      userActions = new Map();
      this.lastActionTime.set(userId, userActions);
    }
    userActions.set(source, Date.now());
  }
  
  /**
   * Получить количество действий сегодня
   */
  private getTodayActionCount(userId: string, source: XPSource): number {
    const userLimits = this.dailyLimits.get(userId);
    if (!userLimits) return 0;
    return userLimits.get(source) || 0;
  }
  
  /**
   * Обновить дневной лимит
   */
  private updateDailyLimit(userId: string, source: XPSource): void {
    let userLimits = this.dailyLimits.get(userId);
    if (!userLimits) {
      userLimits = new Map();
      this.dailyLimits.set(userId, userLimits);
    }
    
    const current = userLimits.get(source) || 0;
    userLimits.set(source, current + 1);
    
    // Сбросить лимиты в полночь (упрощённая версия)
    // В реальности нужно использовать более точный механизм
  }
  
  /**
   * Рассчитать требуемый XP для уровня
   */
  private calculateRequiredXP(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.5));
  }
  
  /**
   * Очистить историю действий (для тестирования)
   */
  clearHistory(): void {
    this.actionHistory.clear();
    this.dailyLimits.clear();
    this.lastActionTime.clear();
  }
}

// Экспорт singleton экземпляра
export const gamificationFacade = new GamificationFacade();

