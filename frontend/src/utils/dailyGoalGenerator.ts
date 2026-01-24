/**
 * Генератор ежедневных целей
 * ИСКЛЮЧЕНЫ маршруты для предотвращения накруток
 */

import { DailyGoal, GoalType, UserRank } from '../types/gamification';

// Шаблоны целей
interface GoalTemplate {
  type: GoalType;
  title: string;
  description: string;
  icon: string;
  easy: { target: number; xp: number };
  medium: { target: number; xp: number };
  hard: { target: number; xp: number };
}

const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    type: 'create_posts',
    title: 'Создать посты',
    description: 'Создайте {target} постов',
    icon: '📝',
    easy: { target: 1, xp: 30 },
    medium: { target: 2, xp: 50 },
    hard: { target: 5, xp: 75 },
  },
  {
    type: 'create_markers',
    title: 'Добавить метки',
    description: 'Создайте {target} меток на карте',
    icon: '📍',
    easy: { target: 2, xp: 30 },
    medium: { target: 5, xp: 50 },
    hard: { target: 10, xp: 75 },
  },
  {
    type: 'add_photos',
    title: 'Добавить фото',
    description: 'Добавьте фото к {target} меткам',
    icon: '📷',
    easy: { target: 1, xp: 30 },
    medium: { target: 3, xp: 50 },
    hard: { target: 5, xp: 75 },
  },
  {
    type: 'improve_quality',
    title: 'Улучшить качество',
    description: 'Улучшите качество {target} меток (добавьте описание/фото)',
    icon: '⭐',
    easy: { target: 1, xp: 30 },
    medium: { target: 2, xp: 50 },
    hard: { target: 3, xp: 75 },
  },
  {
    type: 'get_approval',
    title: 'Получить одобрение',
    description: 'Получите одобрение модерации для {target} постов/меток',
    icon: '✅',
    easy: { target: 1, xp: 50 },
    medium: { target: 2, xp: 75 },
    hard: { target: 3, xp: 100 },
  },
];

// Определить сложность на основе ранга
function getDifficultyByRank(rank: UserRank): 'easy' | 'medium' | 'hard' {
  switch (rank) {
    case 'novice':
      return 'easy';
    case 'explorer':
      return 'medium';
    case 'traveler':
    case 'legend':
    case 'geoblogger':
      return 'hard';
    default:
      return 'medium';
  }
}

// Генерировать цели на день
export function generateDailyGoals(
  userRank: UserRank,
  count: number = 4
): DailyGoal[] {
  const difficulty = getDifficultyByRank(userRank);
  const goals: DailyGoal[] = [];
  
  // Выбираем случайные шаблоны
  const shuffled = [...GOAL_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  selected.forEach((template, index) => {
    const config = template[difficulty];
    const goalId = `goal_${Date.now()}_${index}`;
    
    goals.push({
      id: goalId,
      type: template.type,
      title: template.title,
      description: template.description.replace('{target}', config.target.toString()),
      target: config.target,
      current: 0,
      completed: false,
      xpReward: config.xp,
      difficulty,
      icon: template.icon,
    });
  });
  
  return goals;
}

// Обновить прогресс цели
export function updateGoalProgress(
  goals: DailyGoal[],
  type: GoalType,
  amount: number = 1
): DailyGoal[] {
  return goals.map(goal => {
    if (goal.type === type && !goal.completed) {
      const newCurrent = Math.min(goal.current + amount, goal.target);
      return {
        ...goal,
        current: newCurrent,
        completed: newCurrent >= goal.target,
      };
    }
    return goal;
  });
}

// Проверить, все ли цели выполнены
export function areAllGoalsCompleted(goals: DailyGoal[]): boolean {
  return goals.length > 0 && goals.every(goal => goal.completed);
}

// Рассчитать процент выполнения
export function calculateGoalsProgress(goals: DailyGoal[]): number {
  if (goals.length === 0) return 0;
  
  const totalProgress = goals.reduce((sum, goal) => {
    return sum + (goal.current / goal.target);
  }, 0);
  
  return Math.min(100, (totalProgress / goals.length) * 100);
}

// Получить общий XP за все цели
export function getTotalGoalsXP(goals: DailyGoal[]): number {
  return goals
    .filter(goal => goal.completed)
    .reduce((sum, goal) => sum + goal.xpReward, 0);
}


