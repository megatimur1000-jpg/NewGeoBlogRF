/**
 * Компонент карточки уровня пользователя
 * Красивое отображение прогресса как в личном кабинете
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Star, Target, Crown, Award, Zap } from 'lucide-react';
import { useLevelProgress } from '../../hooks/useLevelProgress';

const LevelCard: React.FC = () => {
  const { userLevel, rankInfo, xpToNextLevel, progressPercentage, levelColor, loading } = useLevelProgress();
  
  if (loading || !userLevel) {
    return (
      <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const getRankIcon = () => {
    switch (userLevel.rank) {
      case 'novice': return <Target className="w-5 h-5" />;
      case 'explorer': return <Star className="w-5 h-5" />;
      case 'traveler': return <Trophy className="w-5 h-5" />;
      case 'legend': return <Crown className="w-5 h-5" />;
      case 'geoblogger': return <Award className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };
  
  return (
    <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-200/50 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${levelColor} flex items-center justify-center text-white font-bold shadow-lg`}>
            {userLevel.level}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {getRankIcon()}
              <span className="text-lg font-semibold">{rankInfo?.name || 'Новичок'}</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Уровень {userLevel.level}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {userLevel.currentXP.toLocaleString()} / {userLevel.requiredXP.toLocaleString()} XP
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Прогресс-бар - улучшенный как в личном кабинете */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Прогресс до следующего уровня</span>
            <span className="font-bold text-blue-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="relative">
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Анимированная точка на конце прогресс-бара */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Осталось: {xpToNextLevel} XP</span>
            <span>Всего: {userLevel.totalXP.toLocaleString()} XP</span>
          </div>
        </div>
        
        {/* Информация о ранге */}
        {rankInfo && (
          <div className="pt-4 border-t">
            <div className="flex items-start gap-2">
              <span className="text-2xl">{rankInfo.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{rankInfo.description}</p>
                <div className="mt-2 space-y-1">
                  {rankInfo.privileges.map((privilege, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      {privilege}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LevelCard;


