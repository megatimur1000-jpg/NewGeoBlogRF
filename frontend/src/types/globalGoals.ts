/**
 * Типы для глобальных целей сообщества
 */

export interface GlobalGoalReward {
  type: 'badge' | 'boost' | 'feature' | 'xp';
  name: string;
  description: string;
  amount?: number; // Для XP или буста
}

export interface GlobalGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: GlobalGoalReward;
  deadline: string | null;
  announcement: string;
  category: 'places' | 'posts' | 'users' | 'routes';
  icon: string;
  isTemporary?: boolean;
  progress: number; // 0-100
  remaining: number;
  isCompleted: boolean;
}

export interface GlobalGoalsResponse {
  goals: GlobalGoal[];
  total: number;
  active: number;
}

