/**
 * Виджет глобальных целей сообщества
 * Отображает активные коллективные цели и прогресс
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Target, 
  MapPin, 
  FileText, 
  Users, 
  Navigation,
  Trophy,
  Zap,
  Gift,
  Sparkles,
  Clock,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { getGlobalGoals } from '../../services/globalGoalsService';
import { GlobalGoal } from '../../types/globalGoals';
import { useGamification } from '../../contexts/GamificationContext';
import { isFeatureEnabled } from '../../config/gamificationFeatures';

const iconMap: Record<string, React.ReactNode> = {
  map: <MapPin className="w-4 h-4" />,
  snowflake: <Sparkles className="w-4 h-4" />,
  users: <Users className="w-4 h-4" />,
  post: <FileText className="w-4 h-4" />,
  route: <Navigation className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  places: 'from-blue-500 to-cyan-500',
  posts: 'from-orange-500 to-pink-500',
  users: 'from-purple-500 to-indigo-500',
  routes: 'from-green-500 to-emerald-500',
};

export function GlobalGoalsWidget() {
  const { features } = useGamification();
  const [goals, setGoals] = useState<GlobalGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Проверяем, включены ли глобальные цели (этап 3+)
  // Пока показываем всегда для демонстрации, можно включить проверку позже
  // if (!isFeatureEnabled(features, 'specialEvents')) {
  //   return null;
  // }

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const data = await getGlobalGoals();
        setGoals(data.goals.filter(g => !g.isCompleted).slice(0, 2)); // Показываем первые 2 активные цели
      } catch (error) {
        console.error('Failed to load global goals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white/95 via-purple-50/50 to-pink-50/50 border-2 border-purple-200/70 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
              Цели сообщества
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Если целей нет, показываем пустое состояние
  if (goals.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-purple-500" />
        </div>
        <p className="text-gray-600 font-medium">Активных глобальных целей пока нет</p>
        <p className="text-sm text-gray-500 mt-2">Следите за обновлениями!</p>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white/95 via-purple-50/50 to-pink-50/50 border-2 border-purple-200/70 shadow-xl backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
            Цели сообщества
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {goals.map((goal) => {
          const categoryColor = categoryColors[goal.category] || 'from-gray-500 to-gray-600';
          const IconComponent = iconMap[goal.icon] || <Target className="w-4 h-4" />;
          
          return (
            <div
              key={goal.id}
              className={`relative p-4 rounded-xl bg-gradient-to-br ${
                goal.isCompleted 
                  ? 'from-green-50 to-emerald-50 border-2 border-green-300' 
                  : 'from-white to-gray-50 border-2 border-gray-200'
              } hover:shadow-lg transition-all duration-300`}
            >
              {/* Заголовок цели */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${categoryColor} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
                    {IconComponent}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-gray-900 mb-1">{goal.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{goal.description}</p>
                  </div>
                </div>
                {goal.isCompleted && (
                  <div className="flex-shrink-0 ml-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Прогресс */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {goal.current.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm">/</span>
                    <span className="text-base font-semibold text-gray-700">
                      {goal.target.toLocaleString()}
                    </span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-semibold ${
                      goal.progress >= 80 
                        ? 'bg-green-50 text-green-700 border-green-300' 
                        : goal.progress >= 50
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                        : 'bg-gray-50 text-gray-700 border-gray-300'
                    }`}
                  >
                    {Math.round(goal.progress)}%
                  </Badge>
                </div>
                <div className="relative">
                  <Progress 
                    value={goal.progress} 
                    className="h-2 bg-gray-200"
                  />
                  <div 
                    className={`absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r ${categoryColor} transition-all duration-500`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                {goal.remaining > 0 && (
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Осталось: <span className="font-semibold">{goal.remaining.toLocaleString()}</span>
                  </p>
                )}
              </div>

              {/* Награда */}
              <div className="mb-2 p-2.5 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {goal.reward.type === 'badge' && <Trophy className="w-3.5 h-3.5 text-yellow-600" />}
                    {goal.reward.type === 'boost' && <Zap className="w-3.5 h-3.5 text-yellow-600" />}
                    {goal.reward.type === 'feature' && <Gift className="w-3.5 h-3.5 text-yellow-600" />}
                    {goal.reward.type === 'xp' && <Sparkles className="w-3.5 h-3.5 text-yellow-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-xs text-gray-900">{goal.reward.name}</div>
                    <div className="text-xs text-gray-600 leading-tight">{goal.reward.description}</div>
                  </div>
                </div>
              </div>

              {/* Анонс и дедлайн */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-gray-600 flex-1 min-w-0">
                  <Sparkles className="w-3 h-3 text-purple-500 flex-shrink-0" />
                  <span className="italic truncate">{goal.announcement}</span>
                </div>
                {goal.deadline && (
                  <div className="flex items-center gap-1 text-gray-500 flex-shrink-0 ml-2">
                    <Clock className="w-3 h-3" />
                    <span className="whitespace-nowrap">До {new Date(goal.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

