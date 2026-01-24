/**
 * Хук для управления приветственным модальным окном
 * 
 * Показывает окно при регистрации, если у пользователя есть
 * одобренные действия гостя
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';
import { getAllGuestActions, getGuestId } from '../services/guestActionsService';
import { applyRetroactiveGamification } from '../utils/retroactiveGamification';
import { useAchievements } from './useAchievements';

export const useWelcomeModal = () => {
  const { user } = useAuth();
  const { userLevel, refreshLevel } = useGamification();
  const { achievements } = useAchievements();
  const [showWelcome, setShowWelcome] = useState(false);
  const [retroactiveResult, setRetroactiveResult] = useState<any>(null);
  const [guestActions, setGuestActions] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    // Проверяем, нужно ли показать приветственное окно
    // Делаем это асинхронно в фоне, не блокируя рендеринг
    let isMounted = true;
    
    const checkWelcomeModal = async () => {
      if (!user?.id || !isMounted) return;
      
      // Проверяем, не показывали ли уже
      const welcomeShown = localStorage.getItem(`welcome_shown_${user.id}`);
      if (welcomeShown) return;
      
      // Получаем действия гостя
      const guestId = getGuestId();
      const actions = getAllGuestActions(guestId);
      const approvedActions = actions.filter(a => a.approved);
      
      if (approvedActions.length > 0 && isMounted) {
        // Применяем ретроактивное начисление в фоне, не блокируя UI
        setIsProcessing(true);
        try {
          const result = await applyRetroactiveGamification(guestId, user.id);
          
          if (!isMounted) return;
          
          // Обновляем уровень (не ждем завершения, чтобы не блокировать)
          refreshLevel().catch(() => {});
          
          setRetroactiveResult(result);
          setGuestActions(approvedActions);
          setShowWelcome(true);
          
          // Помечаем, что показали
          localStorage.setItem(`welcome_shown_${user.id}`, 'true');
        } catch (error) {
          console.error('Ошибка при проверке приветственного окна:', error);
        } finally {
          if (isMounted) {
            setIsProcessing(false);
          }
        }
      }
    };
    
    // Большая задержка, чтобы приложение успело загрузиться
    const timer = setTimeout(() => {
      if (isMounted) {
        checkWelcomeModal();
      }
    }, 3000);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user?.id]); // Убираем refreshLevel из зависимостей, чтобы избежать бесконечных обновлений
  
  const closeWelcome = () => {
    setShowWelcome(false);
  };
  
  return {
    showWelcome,
    closeWelcome,
    retroactiveResult,
    guestActions,
    userLevel,
    achievements,
    isProcessing,
  };
};

