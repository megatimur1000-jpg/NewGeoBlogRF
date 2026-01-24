import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Users, TrendingUp, Sparkles, MapPin, Navigation, BookOpen, Calendar, Trophy, X, Target } from "lucide-react";
import communityHero from "../../assets/assets/community-hero.jpg";
import AchievementsDashboard from "../Achievements/AchievementsDashboard";
import { useAuth } from "../../contexts/AuthContext";
import { GlobalGoalsWidget } from "./GlobalGoalsWidget";

export function CommunityHeader() {
  const [showAchievements, setShowAchievements] = useState(false);
  const [showGlobalGoals, setShowGlobalGoals] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = true; // В центре влияния всегда показываем свои достижения

  const handleAchievementsClick = () => {
    if (showAchievements) {
      setShowAchievements(false);
    } else {
      setShowAchievements(true);
      setShowGlobalGoals(false); // Закрываем глобальные цели
    }
  };

  const handleGlobalGoalsClick = () => {
    if (showGlobalGoals) {
      setShowGlobalGoals(false);
    } else {
      setShowGlobalGoals(true);
      setShowAchievements(false); // Закрываем достижения
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl mb-8 group">
      {/* Background with gradient overlay */}
      <div className={`relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 transition-all duration-500 ${
        showAchievements || showGlobalGoals ? 'min-h-[500px]' : 'min-h-[220px] md:min-h-[260px]'
      }`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%223%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
        
        {/* Floating elements */}
        <div className="absolute top-8 right-8 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-8 left-8 w-16 h-16 bg-yellow-400/20 rounded-full blur-lg animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-pink-400/20 rounded-full blur-md animate-pulse delay-500" />
        
        <div className="relative z-10 h-full flex flex-col justify-center py-4 md:py-6">
          <div className="px-6 md:px-8 w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 px-2.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span className="text-yellow-300 font-semibold text-xs">Активное сообщество</span>
              </div>
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span>1,247 участников онлайн</span>
              </div>
            </div>
            
            <div className="max-w-4xl">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                Стань частью
                <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  сообщества исследователей
                </span>
              </h1>
              
              <p className="text-white/90 text-sm md:text-base mb-4 leading-relaxed max-w-2xl">
                Открывай новые места, создавай маршруты, делись историями путешествий 
                и получай награды за свою активность.
              </p>
            </div>
          </div>
          
          {/* Кнопки - выровнены по центру всего баннера */}
          <div className="px-6 md:px-8 w-full flex justify-center">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                variant="outline" 
                size="default" 
                className="gap-2 px-6 py-2.5 text-sm border-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 bg-white/20 text-white border-white/30 hover:bg-white/30"
                onClick={() => navigate('/login')}
              >
                <Users className="w-4 h-4" />
                Присоединиться
              </Button>
              <Button 
                variant="outline" 
                size="default" 
                className={`gap-2 px-6 py-2.5 text-sm border-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                  showAchievements
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
                onClick={handleAchievementsClick}
              >
                <Trophy className="w-4 h-4" />
                Личные достижения
              </Button>
              <Button 
                variant="outline" 
                size="default" 
                className={`gap-2 px-6 py-2.5 text-sm border-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                  showGlobalGoals
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
                onClick={handleGlobalGoalsClick}
              >
                <Target className="w-4 h-4" />
                Цели сообщества
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats overlay - поднят выше */}
        <div className="absolute top-6 right-6 hidden lg:block z-20">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="text-white text-sm font-semibold mb-3">Активность сегодня</div>
            <div className="grid grid-cols-2 gap-4 text-xs text-white/90">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">47</div>
                  <div>новых мест</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">12</div>
                  <div>маршрутов</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">3</div>
                  <div>события</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Раскрывающиеся секции */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm">
        {/* Секция личных достижений */}
        {showAchievements && (
          <div className="px-8 md:px-12 py-8 animate-in slide-in-from-top-5 duration-500">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Личные достижения
                </h2>
                <button
                  onClick={() => setShowAchievements(false)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <AchievementsDashboard isOwnProfile={isOwnProfile} />
            </div>
          </div>
        )}

        {/* Секция глобальных целей */}
        {showGlobalGoals && (
          <div className="px-8 md:px-12 py-8 animate-in slide-in-from-top-5 duration-500">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Цели сообщества
                </h2>
                <button
                  onClick={() => setShowGlobalGoals(false)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <GlobalGoalsWidget />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}