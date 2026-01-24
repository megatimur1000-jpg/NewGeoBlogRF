/**
 * Хук для работы с прогрессом уровня
 */

import { useMemo } from 'react';
import { useGamification } from '../contexts/GamificationContext';
import { UserLevel, RankInfo } from '../types/gamification';
import { getRankInfo, calculateXPToNextLevel } from '../utils/xpCalculator';

export const useLevelProgress = () => {
  const { userLevel, loading } = useGamification();
  
  const rankInfo = useMemo<RankInfo | null>(() => {
    if (!userLevel) return null;
    return getRankInfo(userLevel.rank);
  }, [userLevel]);
  
  const xpToNextLevel = useMemo(() => {
    if (!userLevel) return 0;
    return calculateXPToNextLevel(userLevel.currentXP, userLevel.requiredXP);
  }, [userLevel]);
  
  const progressPercentage = useMemo(() => {
    if (!userLevel) return 0;
    return userLevel.progress;
  }, [userLevel]);
  
  const levelColor = useMemo(() => {
    if (!userLevel) return 'from-gray-500 to-gray-600';
    
    const level = userLevel.level;
    if (level >= 50) return 'from-purple-500 to-pink-500';
    if (level >= 31) return 'from-blue-500 to-purple-500';
    if (level >= 16) return 'from-green-500 to-blue-500';
    if (level >= 6) return 'from-yellow-500 to-green-500';
    return 'from-gray-500 to-yellow-500';
  }, [userLevel]);
  
  return {
    userLevel,
    rankInfo,
    xpToNextLevel,
    progressPercentage,
    levelColor,
    loading,
  };
};


