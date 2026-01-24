/**
 * Виджет ежедневных целей
 * Отображает цели на день, прогресс и стрик
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Target, CheckCircle2, Clock, Flame } from 'lucide-react';
import { useDailyGoals } from '../../hooks/useDailyGoals';
import { useGamification } from '../../contexts/GamificationContext';
import { isFeatureEnabled } from '../../config/gamificationFeatures';

const DailyGoalsWidget: React.FC = () => {
  const { 
    dailyGoals, 
    allCompleted, 
    progress, 
    totalXP, 
    goalsByDifficulty,
    timeUntilReset,
    claimDailyReward 
  } = useDailyGoals();
  
  const { stats, features } = useGamification();
  const streak = stats?.dailyGoals?.streak || 0;
  
  // Проверяем, включены ли ежедневные цели
  if (!isFeatureEnabled(features, 'dailyGoals')) {
    return null; // Функция отключена
  }
  
  if (dailyGoals.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white to-purple-50/50 border-purple-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-purple-500" />
            Цели недели
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Цели загружаются...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-gradient-to-br from-white to-purple-50/50 border-purple-200/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-purple-500" />
            Ежедневные цели
          </CardTitle>
          {streak > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-bold">{streak}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <span>Прогресс: {Math.round(progress)}%</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Сброс через {timeUntilReset.hours}ч {timeUntilReset.minutes}м</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Общий прогресс */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{dailyGoals.filter(g => g.completed).length} / {dailyGoals.length} выполнено</span>
            <span>{totalXP} XP</span>
          </div>
        </div>
        
        {/* Список целей */}
        <div className="space-y-3">
          {dailyGoals.map((goal) => (
            <div
              key={goal.id}
              className={`p-3 rounded-lg border-2 transition-all ${
                goal.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-xl">{goal.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-800">{goal.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          goal.difficulty === 'easy' ? 'bg-green-50 text-green-700 border-green-200' :
                          goal.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {goal.difficulty === 'easy' ? 'Легко' :
                         goal.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{goal.description}</p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(goal.current / goal.target) * 100} 
                        className="h-1.5 flex-1"
                      />
                      <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                        {goal.current} / {goal.target}
                      </span>
                    </div>
                  </div>
                </div>
                {goal.completed && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Кнопка получения награды */}
        {allCompleted && (
          <button
            onClick={claimDailyReward}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            🎁 Получить награду (+{Math.round(totalXP * 1.5)} XP)
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyGoalsWidget;


