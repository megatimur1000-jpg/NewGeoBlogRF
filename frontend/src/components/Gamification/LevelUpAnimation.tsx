/**
 * Анимация повышения уровня
 * Показывается в центре экрана при повышении уровня
 */

import React, { useEffect, useState } from 'react';
import { Trophy, Sparkles } from 'lucide-react';

interface LevelUpAnimationProps {
  newLevel: number;
  rank?: string;
  onClose?: () => void;
}

const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({ 
  newLevel, 
  rank,
  onClose 
}) => {
  const [visible, setVisible] = useState(true);
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    // Показываем контент после небольшой задержки
    const contentTimer = setTimeout(() => setShowContent(true), 100);
    
    // Скрываем через 4 секунды
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 500);
    }, 4000);
    
    return () => {
      clearTimeout(contentTimer);
      clearTimeout(hideTimer);
    };
  }, [onClose]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Затемнение */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      {/* Анимация */}
      <div className={`relative z-10 transition-all duration-500 ${
        showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`}>
        <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-8 shadow-2xl text-center min-w-[300px]">
          {/* Конфетти эффект */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10">
            <div className="mb-4 flex justify-center">
              <div className="bg-white/20 rounded-full p-4 animate-bounce">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2 animate-pulse">
              Уровень повышен!
            </h2>
            
            <div className="text-6xl font-black text-white mb-2">
              {newLevel}
            </div>
            
            {rank && (
              <p className="text-lg text-white/90 mb-4">
                Новый ранг: {rank}
              </p>
            )}
            
            <div className="flex items-center justify-center gap-2 text-white/80">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Продолжайте в том же духе!</span>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LevelUpAnimation;


