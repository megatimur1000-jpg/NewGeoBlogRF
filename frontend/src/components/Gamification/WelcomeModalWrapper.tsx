/**
 * Обёртка для приветственного модального окна
 * Автоматически показывает окно при регистрации
 */

import React from 'react';
import { useWelcomeModal } from '../../hooks/useWelcomeModal';
import WelcomeModal from './WelcomeModal';
import { useGamification } from '../../contexts/GamificationContext';
import { useAchievements } from '../../hooks/useAchievements';

const WelcomeModalWrapper: React.FC = () => {
  const {
    showWelcome,
    closeWelcome,
    retroactiveResult,
    guestActions,
    isProcessing,
  } = useWelcomeModal();
  
  // Хуки должны вызываться на верхнем уровне
  const { userLevel } = useGamification();
  const { achievements } = useAchievements();
  
  // Не блокируем рендеринг приложения, если данные еще не загружены
  if (!showWelcome || !userLevel || !retroactiveResult) {
    return null;
  }
  
  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Обработка ваших достижений...</p>
        </div>
      </div>
    );
  }
  
  return (
    <WelcomeModal
      userLevel={userLevel}
      achievements={achievements}
      guestActions={guestActions}
      retroactiveResult={retroactiveResult}
      onClose={closeWelcome}
    />
  );
};

export default WelcomeModalWrapper;

