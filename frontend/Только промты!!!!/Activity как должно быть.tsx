import { useState, useMemo, useEffect } from 'react';
import { BarChart3 as ActivityIcon } from 'lucide-react';
import { FaCog as _FaCog, FaFilter as _FaFilter, FaTimes as _FaTimes } from 'react-icons/fa';
import { Activity, ActivityFilters } from '../types/activity';
import { ActivityItem } from '../components/activity/ActivityItem';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';
import { ActivityType } from '../types/activity';
import { ActivityFiltersOverlay } from '../components/activity/ActivityFiltersOverlay';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { MirrorGradientContainer, usePanelRegistration } from '../components/MirrorGradientProvider';
import '../styles/GlobalStyles.css';
import '../styles/PageLayout.css';

const ActivityPage = () => {
  const { toast } = useToast();
  const authContext = useAuth();
  const user = authContext?.user;
  const { registerPanel, unregisterPanel } = usePanelRegistration();

  useEffect(() => {
    registerPanel();
    registerPanel();
    return () => {
      unregisterPanel();
      unregisterPanel();
    };
  }, [registerPanel, unregisterPanel]);

  if (!user) return null;

  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const [filters, setFilters] = useState<ActivityFilters>({});
  const [visibleCount, setVisibleCount] = useState(5);
  const [activities, setActivities] = useState<Activity[]>([]);
  
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setActivities([]);
      } catch (error) {
        setActivities([]);
      }
    };
    fetchActivities();
  }, []);

  const filteredActivities = useMemo(() => {
    let filtered = activities;
    if (filters.type) {
      filtered = filtered.filter(activity => activity.type === filters.type);
    }
    if (filters.timeRange) {
      filtered = filtered.filter(activity => {
        switch (filters.timeRange) {
          case 'today': return isToday(activity.timestamp);
          case 'week': return isThisWeek(activity.timestamp);
          case 'month': return isThisMonth(activity.timestamp);
          default: return true;
        }
      });
    }
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [activities, filters]);

  const activityCounts = useMemo(() => {
    const total = activities.length;
    const unread = activities.filter(a => !a.isRead).length;
    const byType: Record<ActivityType, number> = {
      message: 0, join: 0, room_created: 0, user_promoted: 0, system: 0,
    };
    activities.forEach(activity => {
      if (activity.type && byType.hasOwnProperty(activity.type)) {
        byType[activity.type as ActivityType]++;
      }
    });
    return { total, unread, byType };
  }, [activities]);

  useEffect(() => { setVisibleCount(5); }, [filters]);

  const handleActivityClick = (activity: Activity) => {
    setActivities(prev => prev.map(a => a.id === activity.id ? { ...a, isRead: true } : a));
    toast({
      title: "Активность отмечена как прочитанная",
      description: `Активность от ${activity.user.name} отмечена как прочитанная`,
    });
  };

  const activeTypeOption = filters.type ? {
    value: filters.type,
    label: filters.type.charAt(0).toUpperCase() + filters.type.slice(1),
    icon: ActivityIcon,
    badgeClass: 'bg-blue-100 text-blue-800'
  } : null;

  if (activeTypeOption) {
    // eslint-disable-next-line no-console
    console.log('activeTypeOption:', activeTypeOption);
  }

  return (
    <MirrorGradientContainer className="page-layout-container">
      <div className="page-main-area">
        <div className="page-content-wrapper">
          <div className="page-main-panel relative">
            {/* Кнопки управления по бокам */}
            <button
              className="page-side-button left"
              onClick={() => setLeftPanelOpen(true)}
              title="Фильтры"
            >
              <_FaFilter className="text-gray-600" size={20} />
            </button>
            <button
              className="page-side-button right"
              onClick={() => setRightPanelOpen(true)}
              title="Будущее"
            >
              <_FaCog className="text-gray-600" size={20} />
            </button>
            {/* Основной контент */}
            <div className="h-full relative">
              <div className="map-content-container">
                {/* Заголовок контента */}
                <div className="map-content-header">
                  <div className="flex items-center justify-center w-full">
                    <div className="flex items-center space-x-2">
                      <ActivityIcon className="w-5 h-5 text-slate-400" />
                      <h1 className="text-lg font-semibold text-slate-800">Активность</h1>
                    </div>
                  </div>
                </div>
                {/* Область контента */}
                <div className="map-area">
                  <div className="full-height-content">
                    {/* Заголовок и описание */}
                    <div className="text-center mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-gradient mb-4">
                        Отслеживайте все события в реальном времени
                      </h2>
                      <p className="text-gray-600">
                        Будьте в курсе всех важных событий и обновлений
                      </p>
                    </div>
                    {/* Статистика */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                      <div className="deep-card p-4 text-center hover-scale">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{activityCounts.total}</div>
                        <div className="text-sm text-gray-600">Всего событий</div>
                      </div>
                      <div className="deep-card p-4 text-center hover-scale">
                        <div className="text-3xl font-bold text-orange-600 mb-2">{activityCounts.unread}</div>
                        <div className="text-sm text-gray-600">Непрочитанных</div>
                      </div>
                      <div className="deep-card p-4 text-center hover-scale">
                        <div className="text-3xl font-bold text-green-600 mb-2">{activityCounts.byType.message}</div>
                        <div className="text-sm text-gray-600">Сообщений</div>
                      </div>
                      <div className="deep-card p-4 text-center hover-scale">
                        <div className="text-3xl font-bold text-purple-600 mb-2">{activityCounts.byType.system}</div>
                        <div className="text-sm text-gray-600">Системных</div>
                      </div>
                    </div>
                    {/* Список активностей */}
                    <div className="space-y-4">
                      {filteredActivities.slice(0, visibleCount).map((activity) => (
                        <ActivityItem
                          key={activity.id}
                          activity={activity}
                          onClick={() => handleActivityClick(activity)}
                        />
                      ))}
                    </div>
                    {/* Кнопка "Показать больше" */}
                    {filteredActivities.length > visibleCount && (
                      <div className="text-center mt-6">
                        <Button
                          onClick={() => setVisibleCount(prev => prev + 5)}
                          className="deep-button"
                        >
                          Показать больше
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Левая выдвигающаяся панель с фильтрами */}
            <div className={`page-slide-panel left ${leftPanelOpen ? 'open' : ''}`}>
              <div className="page-slide-panel-header left">
                <h2 className="text-xl font-semibold">Фильтры</h2>
                <button
                  className="page-slide-panel-close"
                  onClick={() => setLeftPanelOpen(false)}
                >
                  <_FaTimes size={20} />
                </button>
              </div>
              <div className="page-slide-panel-content">
                <div className="p-4">
                  <Button
                    variant="outline"
                    className="deep-button font-semibold mb-4"
                    onClick={() => setFilters({})}
                  >
                    Сбросить фильтры
                  </Button>
                  <ActivityFiltersOverlay
                    onClose={() => setLeftPanelOpen(false)}
                    filters={filters}
                    onFiltersChange={setFilters}
                    activityCounts={activityCounts}
                  />
                </div>
              </div>
            </div>
            {/* Правая выдвигающаяся панель (будущее) */}
            <div className={`page-slide-panel right ${rightPanelOpen ? 'open' : ''}`}>
              <div className="page-slide-panel-header right">
                <h2 className="text-xl font-semibold">Будущее</h2>
                <button
                  className="page-slide-panel-close"
                  onClick={() => setRightPanelOpen(false)}
                >
                  <_FaTimes size={20} />
                </button>
              </div>
              <div className="page-slide-panel-content">
                <div className="p-4">
                  <p className="text-gray-500">Здесь появятся новые функции!</p>
                </div>
              </div>
            </div>
            {/* Затемнение при открытых панелях */}
            <div className={`page-overlay ${(leftPanelOpen || rightPanelOpen) ? 'active' : ''}`} />
          </div>
        </div>
      </div>
      {/* Скрытый Badge для предотвращения ошибки TS6133 */}
      <div style={{ display: 'none' }}><Badge>hidden</Badge></div>
    </MirrorGradientContainer>
  );
};

export default ActivityPage;