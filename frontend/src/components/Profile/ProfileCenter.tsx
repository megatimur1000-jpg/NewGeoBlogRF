import React, { useState, useEffect } from 'react';
import { FaMapMarkedAlt, FaStar, FaTrophy, FaUsers, FaCamera, FaHeart, FaComment, FaShare, FaEye, FaCalendarAlt, FaMapPin, FaComments, FaHandshake, FaArchive, FaEdit, FaCrown, FaGem, FaMedal, FaAward, FaRocket, FaFire } from 'react-icons/fa';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAchievements, type Achievement } from '../../hooks/useAchievements';
import { useUserData } from '../../hooks/useUserData';
import { useFriends } from '../../hooks/useFriends';
import FriendProfile from './FriendProfile';
import ContentCard, { type ContentCardData } from './ContentCards/ContentCard';
import PostCard from './ContentCards/PostCard';
import RouteCard from './ContentCards/RouteCard';
import PlaceCard from './ContentCards/PlaceCard';
import AchievementsDashboard from '../Achievements/AchievementsDashboard';

interface ProfileCenterProps {
  userId?: string;
  isOwnProfile?: boolean;
}

// Цветовая схема для орбит
const orbitColors = {
  routes: '#3b82f6',      // Синий
  posts: '#8b5cf6',       // Фиолетовый
  places: '#f59e0b',      // Оранжевый
  events: '#ef4444',      // Красный
  chats: '#06b6d4',       // Голубой
  meetings: '#ec4899',    // Розовый
  archive: '#6b7280',     // Серый
  achievements: '#f59e0b', // Желтый
  friends: '#10b981',     // Зеленый
};

// Стили для орбит
const orbitStyles = {
  routes: 'from-blue-500 to-blue-600',
  posts: 'from-purple-500 to-purple-600',
  places: 'from-orange-500 to-orange-600',
  events: 'from-red-500 to-red-600',
  chats: 'from-cyan-500 to-cyan-600',
  meetings: 'from-pink-500 to-pink-600',
  archive: 'from-gray-500 to-gray-600',
  achievements: 'from-yellow-500 to-yellow-600',
  friends: 'from-emerald-500 to-emerald-600',
};

const ProfileCenter: React.FC<ProfileCenterProps> = ({ 
  userId, 
  isOwnProfile = true 
}) => {
  const auth = useAuth();
  const favorites = useFavorites();
  const { achievements, getUnlockedAchievements, getPublicAchievements } = useAchievements();
  const userData = useUserData();
  const { friends } = useFriends();
  const [activeOrbit, setActiveOrbit] = useState<string | null>(null);
  const [hoveredOrbit, setHoveredOrbit] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<ContentCardData[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  const [viewMode, setViewMode] = useState<'main' | 'achievements'>('main');
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

  // Получаем данные пользователя
  const user = auth?.user;
  const favoritesStats = favorites?.getFavoritesStats() || {
    totalRoutes: 0,
    totalPlaces: 0,
    totalEvents: 0,
    totalItems: 0
  };

  // Моковые данные для демонстрации
  const mockData = {
    routes: [
      {
        id: '1',
        type: 'route' as const,
        title: 'Владимир-Казань',
        preview: 'Красивый маршрут через...',
        rating: 4.9,
        stats: { views: 567, likes: 23, comments: 8, shares: 12 },
        metadata: {
          createdAt: new Date('2024-10-10'),
          updatedAt: new Date('2024-10-10'),
          category: 'автопутешествие',
          tags: ['#автопутешествие', '#золотоекольцо']
        },
        interactive: { canRead: true, canEdit: true, canShare: true }
      }
    ],
    posts: [
      {
        id: '1',
        type: 'post' as const,
        title: 'В Париже дождик!',
        preview: 'Сегодня в Париже идет дождь, но...',
        mapData: { lat: 48.8566, lng: 2.3522, zoom: 12 },
        rating: 4.2,
        stats: { views: 234, likes: 12, comments: 3, shares: 5 },
        metadata: {
          createdAt: new Date('2024-10-12'),
          updatedAt: new Date('2024-10-12'),
          category: 'путешествие',
          tags: ['#париж', '#дождь']
        },
        interactive: { canRead: true, canEdit: true, canShare: true }
      }
    ],
    places: [
      {
        id: '1',
        type: 'place' as const,
        title: 'Ресторан "Золотой дракон"',
        preview: 'Отличная китайская кухня в...',
        mapData: { lat: 55.7558, lng: 37.6176, zoom: 15 },
        rating: 5.0,
        stats: { views: 89, likes: 8, comments: 2, shares: 1 },
        metadata: {
          createdAt: new Date('2024-10-08'),
          updatedAt: new Date('2024-10-08'),
          category: 'ресторан',
          tags: ['#ресторан', '#китайскаякухня']
        },
        interactive: { canRead: true, canEdit: true, canShare: true }
      }
    ],
    events: [
      {
        id: '1',
        type: 'event' as const,
        title: 'Фестиваль путешественников',
        preview: 'Отличное мероприятие для...',
        rating: 4.5,
        stats: { views: 156, likes: 18, comments: 6, shares: 4 },
        metadata: {
          createdAt: new Date('2024-10-05'),
          updatedAt: new Date('2024-10-05'),
          category: 'фестиваль',
          tags: ['#фестиваль', '#путешественники']
        },
        interactive: { canRead: true, canEdit: false, canShare: true }
      }
    ],
    chats: [
      {
        id: '1',
        type: 'post' as const,
        title: 'Обсуждение маршрута',
        preview: 'Интересная дискуссия о...',
        rating: 4.3,
        stats: { views: 45, likes: 8, comments: 12, shares: 2 },
        metadata: {
          createdAt: new Date('2024-10-14'),
          updatedAt: new Date('2024-10-14'),
          category: 'обсуждение',
          tags: ['#чат', '#маршрут']
        },
        interactive: { canRead: true, canEdit: true, canShare: false }
      }
    ],
    meetings: [
      {
        id: '1',
        type: 'event' as const,
        title: 'Встреча путешественников',
        preview: 'Планируем встречу в...',
        rating: 4.7,
        stats: { views: 78, likes: 15, comments: 5, shares: 3 },
        metadata: {
          createdAt: new Date('2024-10-13'),
          updatedAt: new Date('2024-10-13'),
          category: 'встреча',
          tags: ['#встреча', '#путешественники']
        },
        interactive: { canRead: true, canEdit: true, canShare: true }
      }
    ],
    archive: [
      {
        id: '1',
        type: 'post' as const,
        title: 'Старый пост о поездке',
        preview: 'Архивная запись о...',
        rating: 4.1,
        stats: { views: 23, likes: 3, comments: 1, shares: 0 },
        metadata: {
          createdAt: new Date('2024-09-15'),
          updatedAt: new Date('2024-09-15'),
          category: 'архив',
          tags: ['#архив', '#старое']
        },
        interactive: { canRead: true, canEdit: false, canShare: false }
      }
    ],
    achievements: [
      {
        id: '1',
        type: 'achievement' as const,
        title: 'Первый маршрут',
        preview: 'Создан первый маршрут',
        rating: 5.0,
        stats: { views: 0, likes: 0, comments: 0, shares: 0 },
        metadata: {
          createdAt: new Date('2024-09-01'),
          updatedAt: new Date('2024-09-01'),
          category: 'достижение',
          tags: ['#первыймаршрут']
        },
        interactive: { canRead: true, canEdit: false, canShare: false }
      }
    ]
  };

  // Обработчики событий
  const handleOrbitClick = (orbitType: string) => {
    if (orbitType === 'achievements') {
      setViewMode('achievements');
      return;
    }
    
    if (orbitType === 'friends') {
      // Для друзей показываем простой список
      setActiveOrbit(orbitType);
      setModalContent([]); // Пустой контент, друзья отображаются отдельно
      setModalTitle(getOrbitTitle(orbitType));
      setShowModal(true);
      return;
    }
    
    setActiveOrbit(orbitType);
    
    // Используем реальные данные вместо моковых
    const realData = {
      routes: userData.routes,
      posts: userData.posts,
      places: userData.places,
      events: [], // Пока пустой массив
      chats: [], // Пока пустой массив
      meetings: [], // Пока пустой массив
      archive: [] // Пока пустой массив
    };
    
    setModalContent(realData[orbitType as keyof typeof realData] || []);
    setModalTitle(getOrbitTitle(orbitType));
    setShowModal(true);
  };

  const handleBackToMain = () => {
    setViewMode('main');
  };

  const handleOrbitHover = (orbitType: string | null) => {
    setHoveredOrbit(orbitType);
  };

  const handleRatingChange = (item: ContentCardData, rating: number) => {
    // Здесь будет логика обновления рейтинга через API
    console.log(`Обновление рейтинга для ${item.type} ${item.id}: ${rating}`);
    // TODO: Реализовать API вызов для обновления рейтинга
  };


  const getOrbitTitle = (orbitType: string): string => {
    const titles = {
      routes: 'Маршруты',
      posts: 'Посты',
      places: 'Места',
      events: 'События',
      chats: 'Чаты',
      meetings: 'Встречи',
      archive: 'Архив',
      achievements: 'Достижения',
      friends: 'Друзья'
    };
    return titles[orbitType as keyof typeof titles] || orbitType;
  };

  const getOrbitCount = (orbitType: string): number => {
    const counts = {
      routes: userData.routes.length,
      posts: userData.posts.length,
      places: userData.places.length,
      events: favoritesStats.totalEvents,
      chats: 15, // Временно, пока не интегрированы чаты
      meetings: 3, // Временно, пока не интегрированы встречи
      archive: 7, // Временно, пока не интегрирован архив
      achievements: isOwnProfile ? getUnlockedAchievements().length : getPublicAchievements().length,
      friends: friends.length
    };
    return counts[orbitType as keyof typeof counts] || 0;
  };

  const getOrbitIcon = (orbitType: string) => {
    const icons = {
      routes: FaMapMarkedAlt,
      posts: FaEdit,
      places: FaStar,
      events: FaCalendarAlt,
      chats: FaComments,
      meetings: FaHandshake,
      archive: FaArchive,
      achievements: FaTrophy,
      friends: FaUsers
    };
    const IconComponent = icons[orbitType as keyof typeof icons] || FaStar;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="relative w-full h-full">
      {viewMode === 'main' ? (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Центральная сфера с аватаром */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Красивая рамка вокруг аватара */}
        <div className="relative">
          {/* Тонкая внешняя рамка */}
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-30 animate-pulse"></div>
          
          {/* Аватар */}
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl ring-2 ring-white/30">
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="text-white text-3xl font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          
          {/* Индикатор онлайн статуса */}
          <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg">
            <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
          </div>
        </div>
        
      </div>

          {/* Орбиты метрик */}
          {Object.keys(orbitColors).map((orbitType, index) => {
          const angle = (index * 40) * (Math.PI / 180); // 40 градусов между орбитами (9 орбит без блогов)
          const radius = 160; // Увеличиваем радиус орбиты
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          const isActive = activeOrbit === orbitType;
          const isHovered = hoveredOrbit === orbitType;
          const count = getOrbitCount(orbitType);
          
          return (
            <div
              key={orbitType}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                isHovered ? 'scale-110' : 'scale-100'
              } ${isActive ? 'scale-105' : ''}`}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
              onClick={() => handleOrbitClick(orbitType)}
              onMouseEnter={() => handleOrbitHover(orbitType)}
              onMouseLeave={() => handleOrbitHover(null)}
            >
              {/* Орбита */}
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${orbitStyles[orbitType as keyof typeof orbitStyles]} flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
                isHovered ? 'ring-2 ring-white/50 scale-110' : 'scale-100'
              } ${isActive ? 'scale-105 ring-1 ring-white/30' : ''}`}>
                {getOrbitIcon(orbitType)}
              </div>
              
              {/* Счетчик */}
              <div className="absolute -top-1 -right-1 bg-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold text-gray-800 shadow-md border border-gray-200">
                {count}
              </div>
              
              {/* Название орбиты */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 text-xs font-medium text-gray-700 whitespace-nowrap bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm border border-gray-200">
                {getOrbitTitle(orbitType)}
              </div>
            </div>
          );
          })}
        </div>
      ) : (
        // Режим достижений - полный контент из AchievementsDashboard
        <>
          {/* Кнопка возврата к основным разделам */}
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={handleBackToMain}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:text-gray-800 transition-colors shadow-lg border border-gray-200"
              title="Вернуться к основным разделам"
            >
              ←
            </button>
          </div>
          
          {/* Полный контент достижений - точно так же, как в ProfilePanel */}
          <div className="w-full h-full overflow-y-auto">
            <AchievementsDashboard isOwnProfile={isOwnProfile} />
          </div>
        </>
      )}

      {/* Модальное окно с контентом */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Заголовок модального окна */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{modalTitle}</h3>
                  {!isOwnProfile && (
                    <div className="text-sm text-white/80 mt-1">
                      {user?.username} • {user?.role}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Контент модального окна */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid gap-4">
                {modalContent.map((item) => {
                  switch (item.type) {
                    case 'post':
                      return (
                        <PostCard 
                          key={item.id} 
                          post={item} 
                          onRatingChange={handleRatingChange}
                          isOwnProfile={isOwnProfile}
                        />
                      );
                    case 'route':
                      return (
                        <RouteCard 
                          key={item.id} 
                          route={item} 
                          onRatingChange={handleRatingChange}
                          isOwnProfile={isOwnProfile}
                        />
                      );
                    case 'place':
                      return (
                        <PlaceCard 
                          key={item.id} 
                          place={item} 
                          onRatingChange={handleRatingChange}
                          isOwnProfile={isOwnProfile}
                        />
                      );
                    case 'event':
                      return <ContentCard key={item.id} content={item} />;
                    case 'achievement':
                      return <ContentCard key={item.id} content={item} />;
                    default:
                      return <ContentCard key={item.id} content={item} />;
                  }
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Профиль друга */}
      {selectedFriend && (
        <FriendProfile
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
        />
      )}

    </div>
  );
};


export default ProfileCenter;
