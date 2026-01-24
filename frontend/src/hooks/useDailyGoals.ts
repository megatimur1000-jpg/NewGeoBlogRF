/**
 * Хук для работы с ежедневными целями
 */

import { useMemo } from 'react';
import { useGamification } from '../contexts/GamificationContext';
import { DailyGoal } from '../types/gamification';
import { 
  areAllGoalsCompleted, 
  calculateGoalsProgress,
  getTotalGoalsXP 
} from '../utils/dailyGoalGenerator';

export const useDailyGoals = () => {
  const { dailyGoals, completeGoal, claimDailyReward, userLevel } = useGamification();
  
  const allCompleted = useMemo(() => {
    return areAllGoalsCompleted(dailyGoals);
  }, [dailyGoals]);
  
  const progress = useMemo(() => {
    return calculateGoalsProgress(dailyGoals);
  }, [dailyGoals]);
  
  const totalXP = useMemo(() => {
    return getTotalGoalsXP(dailyGoals);
  }, [dailyGoals]);
  
  const goalsByDifficulty = useMemo(() => {
    const easy: DailyGoal[] = [];
    const medium: DailyGoal[] = [];
    const hard: DailyGoal[] = [];
    
    dailyGoals.forEach(goal => {
      if (goal.difficulty === 'easy') easy.push(goal);
      else if (goal.difficulty === 'medium') medium.push(goal);
      else hard.push(goal);
    });
    
    return { easy, medium, hard };
  }, [dailyGoals]);
  
  const timeUntilReset = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, total: diff };
  }, []);
  
  return {
    dailyGoals,
    allCompleted,
    progress,
    totalXP,
    goalsByDifficulty,
    timeUntilReset,
    completeGoal,
    claimDailyReward,
    userLevel,
  };
};


