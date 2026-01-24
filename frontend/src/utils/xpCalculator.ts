/**
 * Утилиты для расчёта XP и уровней
 */

import { UserLevel, UserRank, RankInfo } from '../types/gamification';

// Формула: XP_требуемое = 100 * уровень^1.5
export function calculateRequiredXP(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

// Рассчитать прогресс до следующего уровня (0-100%)
export function calculateProgress(currentXP: number, requiredXP: number): number {
  if (requiredXP === 0) return 100;
  return Math.min(100, Math.max(0, (currentXP / requiredXP) * 100));
}

// Определить ранг по уровню
export function getRankByLevel(level: number): UserRank {
  if (level >= 50) return 'geoblogger';
  if (level >= 31) return 'legend';
  if (level >= 16) return 'traveler';
  if (level >= 6) return 'explorer';
  return 'novice';
}

// Получить информацию о ранге
export function getRankInfo(rank: UserRank): RankInfo {
  const ranks: Record<UserRank, RankInfo> = {
    novice: {
      name: 'Новичок',
      emoji: '🌱',
      description: 'Начало пути исследователя',
      privileges: ['Создание постов', 'Создание меток'],
      levelRange: [1, 5],
    },
    explorer: {
      name: 'Исследователь',
      emoji: '🔍',
      description: 'Активный участник сообщества',
      privileges: ['Все возможности Новичка', 'Приоритетная модерация'],
      levelRange: [6, 15],
    },
    traveler: {
      name: 'Путешественник',
      emoji: '🧭',
      description: 'Опытный исследователь',
      privileges: ['Все возможности Исследователя', 'Расширенные статистики'],
      levelRange: [16, 30],
    },
    legend: {
      name: 'Легенда',
      emoji: '⭐',
      description: 'Признанный мастер',
      privileges: ['Все возможности Путешественника', 'Специальные значки'],
      levelRange: [31, 49],
    },
    geoblogger: {
      name: 'ГеоБлоггер',
      emoji: '👑',
      description: 'Вершина мастерства',
      privileges: ['Все возможности Легенды', 'Эксклюзивные функции'],
      levelRange: [50, Infinity],
    },
  };
  
  return ranks[rank];
}

// Рассчитать уровень на основе общего XP
export function calculateLevelFromTotalXP(totalXP: number): number {
  let level = 1;
  let accumulatedXP = 0;
  
  while (true) {
    const requiredXP = calculateRequiredXP(level);
    if (accumulatedXP + requiredXP > totalXP) {
      break;
    }
    accumulatedXP += requiredXP;
    level++;
    
    // Защита от бесконечного цикла
    if (level > 1000) break;
  }
  
  return level;
}

// Рассчитать XP в текущем уровне
export function calculateCurrentLevelXP(totalXP: number, level: number): number {
  let accumulatedXP = 0;
  for (let i = 1; i < level; i++) {
    accumulatedXP += calculateRequiredXP(i);
  }
  return totalXP - accumulatedXP;
}

// Рассчитать XP до следующего уровня
export function calculateXPToNextLevel(currentLevelXP: number, requiredXP: number): number {
  return Math.max(0, requiredXP - currentLevelXP);
}

// Создать объект UserLevel из общего XP
export function createUserLevelFromTotalXP(totalXP: number): UserLevel {
  const level = calculateLevelFromTotalXP(totalXP);
  const requiredXP = calculateRequiredXP(level);
  const currentLevelXP = calculateCurrentLevelXP(totalXP, level);
  const rank = getRankByLevel(level);
  const progress = calculateProgress(currentLevelXP, requiredXP);
  
  return {
    level,
    currentXP: currentLevelXP,
    requiredXP,
    totalXP,
    rank,
    progress,
  };
}

// Рассчитать итоговый XP с множителями
export function calculateFinalXP(
  baseXP: number,
  multipliers: {
    streak?: number; // Дни стрика (0-365)
    quality?: number; // Множитель качества (0-1)
    bonus?: number; // Дополнительный бонус (0-1)
  } = {}
): number {
  let finalXP = baseXP;
  
  // Множитель стрика
  if (multipliers.streak) {
    if (multipliers.streak >= 30) {
      finalXP *= 1.5; // +50% за 30+ дней
    } else if (multipliers.streak >= 7) {
      finalXP *= 1.25; // +25% за 7+ дней
    }
  }
  
  // Множитель качества
  if (multipliers.quality) {
    finalXP *= (1 + multipliers.quality * 0.2); // До +20% за качество
  }
  
  // Дополнительный бонус
  if (multipliers.bonus) {
    finalXP *= (1 + multipliers.bonus);
  }
  
  return Math.floor(finalXP);
}

// Проверить, нужно ли повышать уровень
export function shouldLevelUp(currentLevelXP: number, requiredXP: number, additionalXP: number): boolean {
  return currentLevelXP + additionalXP >= requiredXP;
}

// Рассчитать новый уровень после добавления XP
export function calculateNewLevel(
  currentLevel: number,
  currentLevelXP: number,
  requiredXP: number,
  additionalXP: number
): {
  newLevel: number;
  newLevelXP: number;
  levelUps: number;
} {
  let newLevel = currentLevel;
  let remainingXP = currentLevelXP + additionalXP;
  let levelUps = 0;
  
  while (remainingXP >= requiredXP) {
    remainingXP -= requiredXP;
    newLevel++;
    levelUps++;
    requiredXP = calculateRequiredXP(newLevel);
    
    // Защита от бесконечного цикла
    if (levelUps > 100) break;
  }
  
  return {
    newLevel,
    newLevelXP: remainingXP,
    levelUps,
  };
}

