import React from 'react';
import storageService from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { useGuest } from '../contexts/GuestContext';
import { useNavigate } from 'react-router-dom';
import { FEATURES } from '../config/features';
import { 
  MapPin, 
  Navigation, 
  BookOpen, 
  BarChart3, 
  Calendar,
  Star,
  Globe,
  Users,
  ArrowRight
} from 'lucide-react';

const HomePage: React.FC = () => {
  const auth = useAuth();
  const user = auth?.user;
  const guest = useGuest();
  const navigate = useNavigate();

  // Если пользователь не авторизован - показываем полную страницу с описанием и формой авторизации
  if (!user) {
    return (
      <div className={`min-h-screen ${FEATURES.RUSSIA_COMPLIANCE_MODE
        ? 'bg-white'
        : 'bg-slate-900'
      }`}>
        {/* Верхняя панель */}
        <div className={`${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Globe className={`w-8 h-8 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-blue-600' : 'text-cyan-400'}`} />
                <h1 className={`text-2xl font-bold ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-900' : 'text-white'}`}>
                  {FEATURES.RUSSIA_COMPLIANCE_MODE ? 'ГеоБлог.РФ' : 'Horizon Explorer'}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Главный контент */}
        <div className="px-6 py-12">
          {/* Приветственная секция */}
          <div className="text-center mb-16">
            <h2 className={`text-6xl font-bold mb-4 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-900' : 'text-white'}`}>
              {FEATURES.RUSSIA_COMPLIANCE_MODE
                ? 'Добро пожаловать в ГеоБлог.РФ'
                : 'Добро пожаловать в будущее'
              }
            </h2>
            <p className={`text-xl mb-8 max-w-3xl mx-auto ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-700' : 'text-white/80'}`}>
              {FEATURES.RUSSIA_COMPLIANCE_MODE
                ? 'Откройте для себя красоты России: находите новые места, планируйте маршруты, читайте истории и создавайте свой уникальный опыт путешественника. Начните исследовать прямо сейчас!'
                : 'Откройте для себя мир возможностей с нашей инновационной платформой для исследования, планирования и общения. Начните создавать контент прямо сейчас!'
              }
            </p>
            
            {/* Индикатор гостевого режима */}
            {guest.hasGuestContent() && (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Гостевой режим активен</span>
                </div>
                <p className="text-xs text-green-600 text-center mt-1">
                  Ваш контент сохраняется локально
                </p>
              </div>
            )}
          </div>

          {/* Форма авторизации */}
          <div className="max-w-md mx-auto mb-16">
            <div className={`${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-slate-700'} rounded-2xl p-8 border`}>
              <h3 className={`text-2xl font-bold text-center mb-6 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-900' : 'text-white'}`}>
                Вход в систему
              </h3>
              <form 
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const email = formData.get('email') as string;
                  const password = formData.get('password') as string;
                  
                  if (email && password) {
                    try {
                      // Получаем токен через API
                      const response = await fetch('/api/users/login', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, password }),
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        const token = data.token;
                        
                        // Используем существующую функцию авторизации
                        if (auth?.login) {
                          await auth.login(token);
                          // После успешной авторизации перенаправляем на главную страницу
                          window.location.href = '/';
                        }
                      } else {
                        const errorData = await response.json().catch(() => ({ message: 'Ошибка авторизации' }));
                        alert(errorData.message || 'Ошибка авторизации. Проверьте данные.');
                      }
                    } catch (error: any) {
                      console.error('Ошибка авторизации:', error);
                      const errorMessage = error.message?.includes('Failed to fetch') || error.code === 'ECONNREFUSED'
                        ? 'Сервер недоступен. Убедитесь, что бэкенд запущен на порту 3002.'
                        : 'Ошибка авторизации. Проверьте данные.';
                      alert(errorMessage);
                    }
                  }
                }}
              >
                <div>
                  <label className={`block text-sm font-medium mb-2 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-700' : 'text-white/80'}`}>
                    Email или логин
                  </label>
                  <input
                    type="text"
                    name="email"
                    className={`w-full px-4 py-3 rounded-lg border ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'bg-white border-gray-300 text-gray-900' : 'bg-slate-700 border-slate-600 text-white'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Введите email или логин"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-700' : 'text-white/80'}`}>
                    Пароль
                  </label>
                  <input
                    type="password"
                    name="password"
                    className={`w-full px-4 py-3 rounded-lg border ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'bg-white border-gray-300 text-gray-900' : 'bg-slate-700 border-slate-600 text-white'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Введите пароль"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Войти
                </button>
              </form>
            </div>
          </div>

          {/* Описание преимуществ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className={`${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-slate-700'} rounded-2xl p-6 border text-center`}>
              <MapPin className={`w-12 h-12 mx-auto mb-4 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-blue-600' : 'text-cyan-400'}`} />
              <h4 className={`text-xl font-bold mb-2 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-900' : 'text-white'}`}>
                Интерактивная карта
              </h4>
              <p className={`${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-600' : 'text-white/70'}`}>
                Исследуйте мир с помощью умной карты
              </p>
            </div>
            <div className={`${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-slate-700'} rounded-2xl p-6 border text-center`}>
              <Calendar className={`w-12 h-12 mx-auto mb-4 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-blue-600' : 'text-cyan-400'}`} />
              <h4 className={`text-xl font-bold mb-2 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-900' : 'text-white'}`}>
                Календарь событий
              </h4>
              <p className={`${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-600' : 'text-white/70'}`}>
                Создавайте и планируйте события
              </p>
            </div>
            <div className={`${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-slate-700'} rounded-2xl p-6 border text-center`}>
              <Navigation className={`w-12 h-12 mx-auto mb-4 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-blue-600' : 'text-cyan-400'}`} />
              <h4 className={`text-xl font-bold mb-2 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-900' : 'text-white'}`}>
                Планировщик маршрутов
              </h4>
              <p className={`${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-600' : 'text-white/70'}`}>
                Создавайте идеальные маршруты
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    if (auth?.logout) {
      auth.logout();
    }
    storageService.clear();
    navigate('/login');
  };

  const features = [
    {
      icon: MapPin,
      title: 'Интерактивная карта',
      description: 'Исследуйте мир с помощью умной карты',
      color: 'from-blue-500 to-cyan-500',
      route: '/map'
    },
    {
      icon: Calendar,
      title: 'Календарь событий',
      description: 'Создавайте и планируйте события',
      color: 'from-purple-500 to-pink-500',
      route: '/calendar'
    },
    // Чаты отключены
    {
      icon: Navigation,
      title: 'Планировщик маршрутов',
      description: 'Создавайте идеальные маршруты',
      color: 'from-orange-500 to-red-500',
      route: '/planner'
    },
    {
      icon: BookOpen,
      title: 'Блог платформа',
      description: 'Делитесь своими историями',
      color: 'from-indigo-500 to-purple-500',
      route: '/posts'
    },
    {
      icon: BarChart3,
      title: 'Аналитика активности',
      description: 'Отслеживайте свой прогресс',
      color: 'from-teal-500 to-blue-500',
      route: '/activity'
    },
    {
      icon: Star,
      title: 'Центр влияния',
      description: 'Атомная вселенная влияния',
      color: 'from-yellow-500 to-orange-500',
      route: '/centre'
    },
  ];

  const stats = [
    { label: 'События', value: '1,247', icon: Calendar },
    { label: 'Пользователи', value: '3,891', icon: Users },
    { label: 'Маршруты', value: '856', icon: Navigation },
    { label: 'Блоги', value: '2,134', icon: BookOpen }
  ];

  return (
    <div className={`min-h-screen ${FEATURES.RUSSIA_COMPLIANCE_MODE 
      ? 'bg-white' 
      : 'bg-slate-900'
    }`}>

      {/* Основной контент */}
      <div className="relative z-10">
        {/* Верхняя панель */}
        <div className={`${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Globe className={`w-8 h-8 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-blue-600' : 'text-cyan-400'}`} />
                <h1 className={`text-2xl font-bold ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-900' : 'text-white'}`}>
                  {FEATURES.RUSSIA_COMPLIANCE_MODE ? 'ГеоБлог.РФ' : 'Horizon Explorer'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className={`${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-600' : 'text-white/80'} text-sm`}>
                Добро пожаловать, <span className={`font-semibold ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-blue-600' : 'text-cyan-400'}`}>{user?.username || 'Пользователь'}</span>!
              </div>
              <button
                onClick={handleLogout}
                className={`px-4 py-2 rounded-lg transition-colors border ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'bg-white text-red-600 hover:bg-red-50 border-red-200' : 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-500/30'}`}
              >
                Выйти
              </button>
            </div>
          </div>
        </div>

        {/* Главный контент */}
        <div className="px-6 py-12 ml-16">
          {/* Приветственная секция */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <h2 className={`text-6xl font-bold mb-4 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-900' : 'text-white'}`}>
              {FEATURES.RUSSIA_COMPLIANCE_MODE 
  ? <>
      Добро пожаловать в ГеоБлог.РФ<br />
      Ваш путеводитель по России
    </>
  : 'Добро пожаловать в будущее'
}
              </h2>
            </div>
            <p className={`text-xl mb-8 max-w-3xl mx-auto ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-700' : 'text-white/80'}`}>
              {FEATURES.RUSSIA_COMPLIANCE_MODE 
                ? 'Откройте для себя красоты России: находите новые места, планируйте маршруты, читайте истории и создавайте свой уникальный опыт путешественника.'
                : 'Откройте для себя мир возможностей с нашей инновационной платформой для исследования, планирования и общения'
              }
            </p>
            <div className="flex items-center justify-center space-x-4">
              {FEATURES.RUSSIA_COMPLIANCE_MODE ? (
                <>
                  <div className="flex items-center space-x-2 text-cyan-400">
                    <MapPin className="w-5 h-5" />
                    <span className="font-semibold">Только Россия</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-400">
                    <Globe className="w-5 h-5" />
                    <span className="font-semibold">Доступность</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-400">
                    <Star className="w-5 h-5" />
                    <span className="font-semibold">Качество</span>
                  </div>
                </>
              ) : (
                <>
              <div className="flex items-center space-x-2 text-cyan-400">
                <span className="font-semibold">⚡ Мгновенный доступ</span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <span className="font-semibold">❤️ Сообщество</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-400">
                <Star className="w-5 h-5" />
                <span className="font-semibold">Премиум качество</span>
              </div>
                </>
              )}
            </div>
          </div>

        {/* Демонстрация карты убрана для ускорения */}

        {/* Комбинированный раздел контента: Анонсы, Посты и Блоги (без чатов) */}
        {FEATURES.RUSSIA_COMPLIANCE_MODE && (
          <div className="px-6 mb-16 ml-16">
            <div className="rounded-2xl p-8 border bg-gray-50 border-gray-200">
              <h3 className="text-3xl font-bold text-gray-900 text-center mb-4">Анонсы, Посты и Блоги</h3>
              <p className="text-gray-700 text-center max-w-3xl mx-auto mb-8">
                В проекте реализованы интерактивные публикации — анонсы, посты сообщества и авторские блоги, в которых география становится неотъемлемой частью повествования и личного самовыражения.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button
                  onClick={() => navigate('/posts')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Перейти к постам
                </button>
                <button
                  onClick={() => navigate('/posts')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Открыть блоги
                </button>
              </div>
            </div>
          </div>
        )}

          {/* Российские ограничения */}
          {FEATURES.RUSSIA_COMPLIANCE_MODE && (
            <div className="mb-12">
              <div className="rounded-2xl p-6 border bg-gray-50 border-gray-200">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Сервис для путешествий по России
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Все маршруты, события и достопримечательности только в границах Российской Федерации
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={`${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-slate-700'} rounded-2xl p-6 border`}>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`w-8 h-8 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-blue-600' : 'text-cyan-400'}`} />
                    <span className={`text-2xl ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-green-600' : 'text-green-400'}`}>📈</span>
                  </div>
                  <div className={`text-3xl font-bold mb-2 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-900' : 'text-white'}`}>{stat.value}</div>
                  <div className={`text-sm ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-600' : 'text-white/60'}`}>{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Основные функции */}
          <div className="mb-16">
            <h3 className={`text-4xl font-bold text-center mb-12 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-900' : 'text-white'}`}>
              Выберите свой путь
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    onClick={() => navigate(feature.route)}
                    className={`cursor-pointer ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'bg-white border-gray-200 hover:bg-gray-50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'} rounded-2xl p-8 border`}
                  >
                    <div className={`w-16 h-16 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'bg-blue-600' : 'bg-blue-600'} rounded-2xl flex items-center justify-center mb-6`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className={`text-2xl font-bold mb-4 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-900' : 'text-white'}`}>
                      {feature.title}
                    </h4>
                    <p className={`mb-6 leading-relaxed ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-600' : 'text-white/70'}`}>
                      {feature.description}
                    </p>
                    <div className={`flex items-center ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-blue-600' : 'text-cyan-400'}`}>
                      <span className="font-semibold">Начать</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
            
          {/* Призыв к действию */}
          <div className="text-center">
            <div className={`${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-slate-700'} rounded-3xl p-12 border`}>
              <div className={`w-16 h-16 mx-auto mb-6 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-blue-600' : 'text-cyan-400'} text-4xl`}>🚀</div>
              <h3 className={`text-3xl font-bold mb-4 ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-900' : 'text-white'}`}>
                {FEATURES.RUSSIA_COMPLIANCE_MODE 
                  ? 'Готовы исследовать Россию?'
                  : 'Готовы начать приключение?'
                }
              </h3>
              <p className={`mb-8 max-w-2xl mx-auto ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'text-gray-600' : 'text-white/80'}`}>
                {FEATURES.RUSSIA_COMPLIANCE_MODE 
                  ? 'Присоединяйтесь к тысячам пользователей, которые уже исследуют красоты России с помощью WayAtom'
                  : 'Присоединяйтесь к тысячам пользователей, которые уже исследуют мир с помощью Horizon Explorer'
                }
              </p>
              <button
                onClick={() => navigate('/map')}
                className={`px-8 py-4 rounded-2xl font-bold text-lg ${FEATURES.RUSSIA_COMPLIANCE_MODE ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {FEATURES.RUSSIA_COMPLIANCE_MODE 
                  ? 'Исследовать Россию'
                  : 'Начать исследование'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
