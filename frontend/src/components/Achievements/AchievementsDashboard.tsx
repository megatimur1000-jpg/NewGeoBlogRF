import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
  FaTrophy, FaStar, FaMedal, FaCrown, FaRocket, FaFire, 
  FaMapMarkerAlt, FaRoute, FaCalendarAlt, FaBlog,
  FaChartLine, FaBullseye, FaHeart, FaEye, FaUserFriends,
  FaMagic, FaLightbulb, FaGem, FaInfinity, FaAward, FaCamera
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useAchievements, type Achievement as NewAchievement } from '../../hooks/useAchievements';

// Простые анимации - все крутящиеся
const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const glowAnimation = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.6); }
  50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.9), 0 0 40px rgba(255, 215, 0, 0.4); }
`;

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
`;

const progressAnimation = keyframes`
  0% { width: 0%; }
  100% { width: var(--progress-width); }
`;

// Styled Components
const DashboardContainer = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="50" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="30" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
    animation: ${css`${floatAnimation} 20s ease-in-out infinite`};
  }
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
`;

const UserLevel = styled.div`
  color: white;
  text-align: left;
  
  h2 {
    font-size: 2rem;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(45deg, #FFD700, #FFA500);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  }
  
  p {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 5px 0 0 0;
  }
`;

const XPSection = styled.div`
  text-align: right;
  color: white;
  position: relative;
`;

const XPDisplay = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 15px 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  
  .xp-current {
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(45deg, #FFE55C, #FFA500);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .xp-total {
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const ProgressBarContainer = styled.div`
  margin-top: 10px;
  position: relative;
`;

const ProgressBarBg = styled.div`
  width: 200px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ width: number }>`
  width: ${props => props.width}%;
  height: 100%;
  background: linear-gradient(90deg, #FFD700, #FFA500, #FF6B6B);
  border-radius: 4px;
  animation: ${css`${progressAnimation} 1s ease-out forwards`};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: calc(${props => props.width}% - 4px);
    width: 12px;
    height: 12px;
    background: #FFD700;
    border-radius: 50%;
    border: 2px solid white;
    animation: ${css`${pulseAnimation} 2s infinite`};
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
  }
`;

const AchievementCard = styled.div<{ type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary', earned: boolean, progress?: number }>`
  background: ${props => {
    // Если достижение заработано - золотой фон
    if (props.earned) {
    switch (props.type) {
      case 'bronze': return 'linear-gradient(135deg, #CD7F32, #A0522D)';
      case 'silver': return 'linear-gradient(135deg, #C0C0C0, #A8A8A8)';
      case 'gold': return 'linear-gradient(135deg, #FFD700, #FFA500)';
      case 'platinum': return 'linear-gradient(135deg, #E5E4E2, #C0C0C0)';
      case 'legendary': return 'linear-gradient(135deg, #9932CC, #8B008B)';
        default: return 'linear-gradient(135deg, #FFD700, #FFA500)';
      }
    }
    
    // Если есть прогресс, но не достигнуто - серый фон
    if (props.progress && props.progress > 0) {
      return 'linear-gradient(135deg, #9CA3AF, #6B7280)';
    }
    
    // Если не начато - белый фон
    return 'linear-gradient(135deg, #f9fafb, #f3f4f6)';
  }};
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid ${props => {
    if (props.earned) return 'rgba(255, 215, 0, 0.8)';
    if (props.progress && props.progress > 0) return 'rgba(156, 163, 175, 0.8)';
    return 'rgba(209, 213, 219, 0.8)';
  }};
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    border-color: ${props => {
      if (props.earned) return 'rgba(255, 215, 0, 1)';
      if (props.progress && props.progress > 0) return 'rgba(156, 163, 175, 1)';
      return 'rgba(209, 213, 219, 1)';
    }};
  }
  
  ${props => props.earned && css`
    animation: ${glowAnimation} 3s ease-in-out infinite;
    
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
      animation: ${spinAnimation} 8s linear infinite;
    }
  `}
`;

const AchievementIcon = styled.div<{ earned: boolean, hasProgress: boolean }>`
  font-size: 2.5rem;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${props => {
    if (props.earned) return '#FFD700'; // Золотой для достигнутых
    if (props.hasProgress) return '#6B7280'; // Серый для в процессе
    return '#9CA3AF'; // Светло-серый для не начатых
  }};
  
  ${props => props.earned && css`
    animation: ${spinAnimation} 6s linear infinite;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
  `}
  
  ${props => props.hasProgress && !props.earned && css`
    animation: ${spinAnimation} 8s linear infinite;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  `}
`;

const AchievementTitle = styled.h3<{ earned: boolean, hasProgress: boolean }>`
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => {
    if (props.earned) return 'white';
    if (props.hasProgress) return '#374151';
    return '#6B7280';
  }};
  text-shadow: ${props => props.earned ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none'};
`;

const AchievementDesc = styled.p<{ earned: boolean, hasProgress: boolean }>`
  margin: 0 0 12px 0;
  font-size: 0.85rem;
  color: ${props => {
    if (props.earned) return 'rgba(255,255,255,0.9)';
    if (props.hasProgress) return '#4B5563';
    return '#9CA3AF';
  }};
  line-height: 1.3;
`;

const AchievementProgress = styled.div<{ earned: boolean, hasProgress: boolean }>`
  background: ${props => {
    if (props.earned) return 'rgba(255,255,255,0.2)';
    if (props.hasProgress) return 'rgba(156, 163, 175, 0.3)';
    return 'rgba(0,0,0,0.1)';
  }};
  border-radius: 8px;
  overflow: hidden;
  height: 6px;
  margin: 8px 0;
`;

const AchievementProgressFill = styled.div<{ width: number, earned: boolean }>`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => {
    if (props.earned) return '#10B981'; // Зеленый для достигнутых
    if (props.width === 100) return '#10B981'; // Зеленый для завершенных
    return '#6B7280'; // Серый для в процессе
  }};
  border-radius: 8px;
  animation: ${css`${progressAnimation} 1s ease-out forwards`};
`;

const XPEarned = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(45deg, #FFD700, #FFA500);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  animation: ${css`${spinAnimation} 10s linear infinite`};
`;

const CategorySection = styled.div`
  margin-top: 30px;
`;

const CategoryTitle = styled.h3`
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const QualityMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const QualityCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 15px;
  text-align: center;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const QualityTitle = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 5px;
`;

const QualityValue = styled.div<{ high?: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.high ? '#4ADE80' : '#FBBF24'};
`;

// Типы достижений
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  xpReward: number;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
  category: string;
  isDynamic?: boolean; // Динамичное достижение
  isLastSignificant?: boolean; // Последнее значимое достижение в категории
}

interface AchievementsDashboardProps {
  isOwnProfile?: boolean;
}

const AchievementsDashboard: React.FC<AchievementsDashboardProps> = ({ isOwnProfile = true }) => {
  const auth = useAuth();
  const { achievements: newAchievements, getAchievementProgress } = useAchievements();
  
  // Моковые данные для демонстрации
  const [userXP] = useState(2847);
  const [userLevel] = useState(15);
  const [xpToNextLevel] = useState(3000);
  const [currentLevelXP] = useState(153);

  // Функция для преобразования новых достижений в формат карточек
  const convertNewAchievementToCard = (newAchievement: NewAchievement): Achievement => {
    // Маппинг иконок
    const iconMap: { [key: string]: React.ReactNode } = {
      'trophy': <FaTrophy />,
      'star': <FaStar />,
      'crown': <FaCrown />,
      'gem': <FaGem />,
      'medal': <FaMedal />,
      'award': <FaAward />,
      'rocket': <FaRocket />,
      'fire': <FaFire />,
      'heart': <FaHeart />,
      'map': <FaMapMarkerAlt />,
      'camera': <FaCamera />,
    };

    // Маппинг типов по редкости
    const typeMap: { [key: string]: 'bronze' | 'silver' | 'gold' | 'platinum' } = {
      'common': 'bronze',
      'rare': 'silver',
      'epic': 'gold',
      'legendary': 'platinum',
    };

    // Маппинг категорий
    const categoryMap: { [key: string]: string } = {
      'places': 'Метки места',
      'posts': 'Посты',
      'blogs': 'Блоги',
      'social': 'Социальные',
      'quality': 'Качество контента',
      'special': 'Специальные',
    };

    return {
      id: newAchievement.id,
      title: newAchievement.title,
      description: newAchievement.description,
      icon: iconMap[newAchievement.icon] || <FaTrophy />,
      type: typeMap[newAchievement.rarity] || 'bronze',
      xpReward: newAchievement.rarity === 'common' ? 50 : 
                newAchievement.rarity === 'rare' ? 150 :
                newAchievement.rarity === 'epic' ? 300 : 500,
      earned: newAchievement.unlocked,
      progress: newAchievement.progress?.current,
      maxProgress: newAchievement.progress?.target,
      category: categoryMap[newAchievement.category] || 'Специальные',
      isDynamic: newAchievement.isDynamic,
      isLastSignificant: newAchievement.isLastSignificant,
    };
  };

  // Преобразуем новые достижения в формат карточек
  const convertedAchievements = newAchievements.map(convertNewAchievementToCard);

  // Используем только новые достижения из унифицированной системы
  const achievements: Achievement[] = convertedAchievements;

  const earnedAchievements = achievements.filter(a => a.earned);
  const totalXP = earnedAchievements.reduce((sum, a) => sum + a.xpReward, 0);
  const progressPercentage = (currentLevelXP / (xpToNextLevel - (userLevel - 1) * 200)) * 100;

  const qualityMetrics = {
    markersQuality: 76,
    routesQuality: 89,
    eventsQuality: 92,
    overallCompletion: 84
  };

  return (
    <DashboardContainer>
      {/* Заголовок с уровнем и XP */}
      <HeaderSection>
        <UserLevel>
          <h2>Уровень {userLevel}</h2>
          <p>{auth?.user?.username || 'Путешественник'}</p>
        </UserLevel>
        
        <XPSection>
          <XPDisplay>
            <div className="xp-current">{totalXP.toLocaleString()} XP</div>
            <div className="xp-total">всего заработано</div>
          </XPDisplay>
          <ProgressBarContainer>
            <ProgressBarBg>
              <ProgressBarFill width={progressPercentage} />
            </ProgressBarBg>
          </ProgressBarContainer>
        </XPSection>
      </HeaderSection>

      {/* Метрики качества */}
      <QualityMetrics>
        <QualityCard>
          <QualityTitle>Качество меток</QualityTitle>
          <QualityValue high={qualityMetrics.markersQuality > 80}>
            {qualityMetrics.markersQuality}%
          </QualityValue>
        </QualityCard>
        <QualityCard>
          <QualityTitle>Качество маршрутов</QualityTitle>
          <QualityValue high={qualityMetrics.routesQuality > 80}>
            {qualityMetrics.routesQuality}%
          </QualityValue>
        </QualityCard>
        <QualityCard>
          <QualityTitle>Качество событий</QualityTitle>
          <QualityValue high={qualityMetrics.eventsQuality > 80}>
            {qualityMetrics.eventsQuality}%
          </QualityValue>
        </QualityCard>
        <QualityCard>
          <QualityTitle>Общая полнота</QualityTitle>
          <QualityValue high={qualityMetrics.overallCompletion > 80}>
            {qualityMetrics.overallCompletion}%
          </QualityValue>
        </QualityCard>
      </QualityMetrics>

      {/* Достижения по категориям */}
      {['Метки места', 'Посты', 'Блоги', 'Качество контента', 'Социальные', 'Специальные'].map(category => {
        const categoryAchievements = achievements.filter(a => {
          // Скрываем "Двигатель проекта", если он не заработан
          if (a.id === 'special_supporter' && !a.earned) {
            return false;
          }
          return a.category === category;
        });
        if (categoryAchievements.length === 0) return null;

        return (
          <CategorySection key={category}>
            <CategoryTitle>{category}</CategoryTitle>
            <AchievementsGrid>
              {categoryAchievements.map(achievement => {
                const hasProgress = achievement.progress !== undefined && achievement.progress > 0;
                const progressPercentage = achievement.progress !== undefined && achievement.maxProgress 
                  ? (achievement.progress / achievement.maxProgress) * 100 
                  : 0;

                // Логика отображения в зависимости от типа профиля
                const shouldShowAsGolden = Boolean(isOwnProfile 
                  ? achievement.earned  // Для собственного профиля: все достигнутые золотые
                  : achievement.isLastSignificant); // Для других: только последнее значимое золотое

                return (
                <AchievementCard 
                  key={achievement.id}
                  type={achievement.type}
                    earned={shouldShowAsGolden}
                  progress={achievement.progress}
                >
                    {shouldShowAsGolden && (
                    <XPEarned>+{achievement.xpReward}</XPEarned>
                  )}
                  
                    <AchievementIcon earned={shouldShowAsGolden} hasProgress={hasProgress}>
                    {achievement.icon}
                  </AchievementIcon>
                  
                    <AchievementTitle earned={shouldShowAsGolden} hasProgress={hasProgress}>
                    {achievement.title}
                  </AchievementTitle>
                  
                    <AchievementDesc earned={shouldShowAsGolden} hasProgress={hasProgress}>
                    {achievement.description}
                  </AchievementDesc>
                  
                    {/* Показываем прогресс-бар только для нединамичных достижений */}
                    {achievement.progress !== undefined && !achievement.isDynamic && (
                      <AchievementProgress earned={shouldShowAsGolden} hasProgress={hasProgress}>
                      <AchievementProgressFill 
                          width={progressPercentage}
                          earned={shouldShowAsGolden}
                      />
                    </AchievementProgress>
                  )}
                  
                    {/* Показываем счетчик только для нединамичных достижений */}
                    {achievement.progress !== undefined && !achievement.isDynamic && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                        color: shouldShowAsGolden ? 'rgba(255,255,255,0.7)' : 
                               hasProgress ? '#4B5563' : '#9CA3AF',
                      marginTop: '4px'
                    }}>
                      {achievement.progress}/{achievement.maxProgress}
                    </div>
                  )}
                    
                    {/* Для динамичных достижений показываем специальный бейдж */}
                    {achievement.isDynamic && shouldShowAsGolden && (
                      <div style={{ 
                        fontSize: '0.7rem', 
                        color: 'rgba(255,255,255,0.9)',
                        marginTop: '8px',
                        padding: '4px 8px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        fontWeight: '600'
                      }}>
                        🏆 ДИНАМИЧНОЕ
                    </div>
                  )}
                </AchievementCard>
                );
              })}
            </AchievementsGrid>
          </CategorySection>
        );
      })}
    </DashboardContainer>
  );
};

export default AchievementsDashboard;
