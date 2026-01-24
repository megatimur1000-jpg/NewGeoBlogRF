/**
 * Приветственное модальное окно для новых пользователей
 * 
 * Показывается при регистрации, если у пользователя есть
 * одобренные действия гостя. Отображает:
 * - Уровень пользователя
 * - Разблокированные достижения
 * - Статистику действий гостя
 * - Поздравление с вкладом в проект
 */

import React, { useEffect, useState } from 'react';
import { X, Trophy, Star, MapPin, FileText, Navigation, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserLevel, Achievement } from '../../types/gamification';
import { GuestAction } from '../../services/guestActionsService';
import { RetroactiveResult } from '../../utils/retroactiveGamification';
import { getRankInfo } from '../../utils/xpCalculator';

interface WelcomeModalProps {
  userLevel: UserLevel;
  achievements: Achievement[];
  guestActions: GuestAction[];
  retroactiveResult: RetroactiveResult;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  userLevel,
  achievements,
  guestActions,
  retroactiveResult,
  onClose,
}) => {
  const [showContent, setShowContent] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  
  const rankInfo = getRankInfo(userLevel.rank);
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  
  useEffect(() => {
    // Показываем контент с задержкой для анимации
    const timer1 = setTimeout(() => setShowContent(true), 200);
    const timer2 = setTimeout(() => setShowAchievements(true), 600);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  
  const stats = {
    posts: guestActions.filter(a => a.actionType === 'post').length,
    markers: guestActions.filter(a => a.actionType === 'marker').length,
    routes: guestActions.filter(a => a.actionType === 'route').length,
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Затемнение */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      {/* Модальное окно */}
      <div className={`relative z-10 bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto pointer-events-auto transition-all duration-500 ${
        showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
        {/* Закрыть */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        {/* Контент */}
        <div className="p-8">
          {/* Заголовок с анимацией */}
          <div className="text-center mb-6">
            <div className="inline-block mb-4">
              <div className="text-6xl animate-bounce">🎉</div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Добро пожаловать!
            </h2>
            <p className="text-lg text-gray-600">
              Вы уже внесли вклад в проект ещё до регистрации!
            </p>
          </div>
          
          {/* Уровень пользователя */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${
                  userLevel.level >= 50 ? 'from-purple-500 to-pink-500' :
                  userLevel.level >= 31 ? 'from-blue-500 to-purple-500' :
                  userLevel.level >= 16 ? 'from-green-500 to-blue-500' :
                  userLevel.level >= 6 ? 'from-yellow-500 to-green-500' :
                  'from-gray-500 to-yellow-500'
                } flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                  {userLevel.level}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{rankInfo.emoji}</span>
                    <span className="text-xl font-bold text-gray-800">{rankInfo.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{rankInfo.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{retroactiveResult.totalXP} XP</div>
                <div className="text-sm text-gray-500">начислено</div>
              </div>
            </div>
            
            {/* Прогресс-бар */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Прогресс до следующего уровня</span>
                <span className="font-bold text-blue-600">{Math.round(userLevel.progress)}%</span>
              </div>
              <div className="relative">
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${userLevel.progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{userLevel.currentXP} / {userLevel.requiredXP} XP</span>
                <span>Всего: {userLevel.totalXP} XP</span>
              </div>
            </div>
          </div>
          
          {/* Статистика действий */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-800">Посты</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{stats.posts}</div>
              <div className="text-xs text-gray-500 mt-1">создано</div>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-800">Метки</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{stats.markers}</div>
              <div className="text-xs text-gray-500 mt-1">создано</div>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-800">Маршруты</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">{stats.routes}</div>
              <div className="text-xs text-gray-500 mt-1">создано</div>
            </div>
          </div>
          
          {/* Достижения */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-bold text-gray-800">
                  Разблокировано достижений: {unlockedAchievements.length}
                </h3>
              </div>
              
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 transition-all duration-500 ${
                showAchievements ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                {unlockedAchievements.slice(0, 8).map((achievement, index) => (
                  <div
                    key={achievement.id}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-3 text-center animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="text-2xl mb-1">
                      {achievement.icon === 'trophy' && <Trophy className="w-6 h-6 mx-auto text-yellow-600" />}
                      {achievement.icon === 'star' && <Star className="w-6 h-6 mx-auto text-yellow-600" />}
                      {achievement.icon === 'crown' && <Sparkles className="w-6 h-6 mx-auto text-yellow-600" />}
                    </div>
                    <div className="text-xs font-medium text-gray-800 leading-tight">
                      {achievement.title}
                    </div>
                    <div className="text-xs text-green-600 mt-1 font-semibold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Разблокировано
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Поздравление */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white text-center">
            <div className="text-4xl mb-3">🎊</div>
            <h3 className="text-xl font-bold mb-2">Спасибо за ваш вклад!</h3>
            <p className="text-blue-100">
              Вы создали {retroactiveResult.actionsProcessed} {retroactiveResult.actionsProcessed === 1 ? 'элемент' : 'элементов'} контента,
              которые уже одобрены модерацией и помогают другим пользователям!
            </p>
          </div>
          
          {/* Кнопка закрытия */}
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Продолжить
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default WelcomeModal;

