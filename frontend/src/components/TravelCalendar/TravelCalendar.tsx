import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { ChevronLeft, ChevronRight, Plane, Bed, Camera, Utensils, Bus, Backpack, Users, Share2, PartyPopper, Beer, Fish, Music, Trophy, Landmark, Flag, Store, Megaphone, Baby, Moon, Image, ChevronDown, Eye, CalendarPlus, Settings, HelpCircle, Flame, TreePine, Droplets, Car, MapPin, Coffee, Heart } from 'lucide-react';
import Icon from 'react-icons-kit';
import { arrowLeftThick } from 'react-icons-kit/typicons/arrowLeftThick';
import { arrowRightThick } from 'react-icons-kit/typicons/arrowRightThick';
import { mockEvents, MockEvent } from './mockEvents';
import { ExternalEvent } from '../../services/externalEventsService';
import { getEventVisualClasses } from '../../utils/visualStates';
import { getEvents, EventApiItem } from '../../services/eventService';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useEventsStore } from '../../stores/eventsStore';
import { useRegionsStore, getRegionIdByName } from '../../stores/regionsStore';
import { offlineContentStorage, OfflineEventDraft } from '../../services/offlineContentStorage';
import { useAuth } from '../../contexts/AuthContext';
import './TravelCalendar.css';
import '../Calendar/CalendarViewSwitcher.css';

// Lazy компоненты
const LazyEventPreviewTooltip = lazy(() => import('../Events/EventPreviewTooltip').then(module => ({ default: module.EventPreviewTooltip })));
const LazyEventsListModal = lazy(() => import('../Events/EventsListModal').then(module => ({ default: module.EventsListModal })));
const LazyEventDetailPage = lazy(() => import('../Events/EventDetailPage').then(module => ({ default: module.EventDetailPage })));

export const categories = [
  { id: 'flights', name: 'Авиабилеты', icon: Plane, color: 'bg-red-500', textColor: 'text-red-600' },
  { id: 'hotels', name: 'Отели', icon: Bed, color: 'bg-orange-500', textColor: 'text-orange-600' },
  { id: 'attractions', name: 'Достопримечательности', icon: Camera, color: 'bg-sky-500', textColor: 'text-sky-600' },
  { id: 'restaurants', name: 'Рестораны', icon: Utensils, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
  { id: 'transport', name: 'Транспорт', icon: Bus, color: 'bg-violet-500', textColor: 'text-violet-600' },
  { id: 'tours', name: 'Экскурсии', icon: Backpack, color: 'bg-amber-500', textColor: 'text-amber-600' },
  // Новые логичные типы событий
  { id: 'holiday', name: 'Праздник', icon: PartyPopper, color: 'bg-pink-500', textColor: 'text-pink-600' },
  { id: 'festival', name: 'Фестиваль', icon: Megaphone, color: 'bg-fuchsia-500', textColor: 'text-fuchsia-600' },
  { id: 'concert', name: 'Концерт', icon: Music, color: 'bg-indigo-500', textColor: 'text-indigo-600' },
  { id: 'sport', name: 'Спорт', icon: Trophy, color: 'bg-lime-500', textColor: 'text-lime-600' },
  { id: 'fishing', name: 'Рыболовное соревнование', icon: Fish, color: 'bg-cyan-500', textColor: 'text-cyan-600' },
  { id: 'oktoberfest', name: 'Октоберфест', icon: Beer, color: 'bg-yellow-400', textColor: 'text-yellow-600' },
  { id: 'parade', name: 'Парад', icon: Flag, color: 'bg-rose-500', textColor: 'text-rose-600' },
  { id: 'theater', name: 'Театр', icon: Megaphone, color: 'bg-purple-600', textColor: 'text-purple-700' },
  { id: 'market', name: 'Ярмарка', icon: Store, color: 'bg-orange-400', textColor: 'text-orange-600' },
  { id: 'exhibition', name: 'Выставка', icon: Image, color: 'bg-purple-500', textColor: 'text-purple-600' },
  { id: 'heritage', name: 'История/Наследие', icon: Landmark, color: 'bg-teal-500', textColor: 'text-teal-600' },
  { id: 'kids', name: 'Для детей', icon: Baby, color: 'bg-blue-400', textColor: 'text-blue-600' },
  { id: 'nightlife', name: 'Ночная жизнь', icon: Moon, color: 'bg-neutral-800', textColor: 'text-neutral-800' },
  // Личные события пользователей
  { id: 'meeting', name: 'Встреча', icon: Users, color: 'bg-green-500', textColor: 'text-green-600' },
  { id: 'spring', name: 'Встреча у родника', icon: Droplets, color: 'bg-blue-400', textColor: 'text-blue-600' },
  { id: 'campfire', name: 'Встреча у костра', icon: Flame, color: 'bg-orange-500', textColor: 'text-orange-600' },
  { id: 'nature', name: 'Встреча на природе', icon: TreePine, color: 'bg-emerald-500', textColor: 'text-emerald-500' },
  { id: 'trip', name: 'Личная поездка', icon: Car, color: 'bg-slate-500', textColor: 'text-slate-600' },
  { id: 'unexpected', name: 'Неожиданное событие', icon: MapPin, color: 'bg-pink-500', textColor: 'text-pink-600' },
  { id: 'coffee', name: 'Встреча за кофе', icon: Coffee, color: 'bg-amber-600', textColor: 'text-amber-700' },
  { id: 'personal', name: 'Личное событие', icon: Heart, color: 'bg-rose-400', textColor: 'text-rose-600' }
];

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function getDaysInMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDate = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days: (number | null)[] = [];
  for (let i = 0; i < startDate; i++) days.push(null);
  for (let day = 1; day <= daysInMonth; day++) days.push(day);
  return days;
}

function formatDateKey(dateIso: string) {
  return dateIso.split('T')[0];
}

// Маппинг категорий из парсера (русские названия) на categoryId календаря
const categoryMapping: { [key: string]: string } = {
  'Фестиваль': 'festival',
  'Концерт': 'concert',
  'Выставка': 'exhibition',
  'Спортивное событие': 'sport',
  'Спорт': 'sport',
  'Ярмарка': 'market',
  // Обратная совместимость с английскими названиями
  'festival': 'festival',
  'concert': 'concert',
  'exhibition': 'exhibition',
  'sport': 'sport',
  'market': 'market'
};

function pickCategoryId(apiItem: EventApiItem): string {
  // Проверяем оба поля - category и event_type
  const raw = (apiItem.category || apiItem.event_type || '').trim();

  if (!raw) {
    return 'festival';
  }

  // Сначала проверяем маппинг для русских названий
  if (categoryMapping[raw]) {
    return categoryMapping[raw];
  }

  // Затем проверяем, есть ли такая категория напрямую
  const exists = categories.some(c => c.id === raw);
  return exists ? raw : 'festival';
}

export function getCategoryById(categoryId: string) {
  return categories.find(cat => cat.id === categoryId);
}

interface TravelCalendarProps {
  selectedEventId?: string;
  showOnlySelected?: boolean;
  viewMode?: 'day' | 'week' | 'month' | 'year';
  onViewModeChange?: (mode: 'day' | 'week' | 'month' | 'year') => void;
  selectedDate?: Date | null;
  onSelectedDateChange?: (date: Date | null) => void;
  onAddEventClick?: () => void;
  onSearchClick?: () => void;
  onLegendClick?: () => void;
}

const TravelCalendar: React.FC<TravelCalendarProps> = ({ 
  selectedEventId, 
  viewMode: externalViewMode = 'month',
  onViewModeChange,
  selectedDate: externalSelectedDate,
  onSelectedDateChange,
  onAddEventClick,
  onSearchClick,
  onLegendClick
}) => {
  const favorites = useFavorites();
  const { selectedRegions } = useRegionsStore();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(null);
  
  // Используем внешний selectedDate если передан, иначе внутренний
  const selectedDate = externalSelectedDate !== undefined ? externalSelectedDate : internalSelectedDate;
  const setSelectedDate = (date: Date | null) => {
    if (onSelectedDateChange) {
      onSelectedDateChange(date);
    } else {
      setInternalSelectedDate(date);
    }
  };
  const [showArchive, setShowArchive] = useState(false);
  const [archiveEvents, setArchiveEvents] = useState<MockEvent[]>([]);
  const [hoveredDate, setHoveredDate] = useState<{ day: number; events: MockEvent[] } | null>(null);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MockEvent | null>(null);
  const [realEvents, setRealEvents] = useState<MockEvent[]>([]);
  const [pendingEventDrafts, setPendingEventDrafts] = useState<MockEvent[]>([]);
  const [selectedCategoryEvents, setSelectedCategoryEvents] = useState<{ categoryId: string; events: MockEvent[]; date: string } | null>(null);
  
  // Загружаем черновики событий для временного отображения
  useEffect(() => {
    if (!user?.id) return; // Только для авторизованных пользователей

    const loadPendingEvents = async () => {
      try {
        await offlineContentStorage.init();
        // Получаем черновики событий со статусом draft, uploading или failed
        const drafts = await offlineContentStorage.getAllDrafts('event');
        
        // Преобразуем черновики в MockEvent для отображения в календаре
        const eventDrafts: MockEvent[] = drafts
          .filter((draft): draft is OfflineEventDraft => draft.contentType === 'event' && draft.status !== 'failed_permanent')
          .map((draft) => {
            const { contentData, id, createdAt } = draft;
            
            // Парсим дату начала события
            const startDate = new Date(contentData.start_datetime || createdAt);
            const endDate = contentData.end_datetime ? new Date(contentData.end_datetime) : undefined;
            
            // Форматируем даты в YYYY-MM-DD
            const formatDate = (date: Date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            };

            return {
              id: `draft_${id}` as any, // Префикс для отличия от обычных событий
              title: contentData.title || 'Новое событие',
              description: contentData.description || '',
              date: formatDate(startDate),
              endDate: endDate ? formatDate(endDate) : undefined,
              categoryId: contentData.category || 'other',
              hashtags: contentData.hashtags || [],
              location: contentData.location || '',
              latitude: contentData.latitude || 0,
              longitude: contentData.longitude || 0,
              // Добавляем флаги для индикации pending статуса
              isPending: true,
              status: 'pending',
              // Сохраняем оригинальный ID черновика для дальнейшей работы
              metadata: { draftId: id, draftStatus: draft.status }
            } as MockEvent & { isPending?: boolean; status?: string; metadata?: any };
          });

        setPendingEventDrafts(eventDrafts);
      } catch (error) {
        console.error('Ошибка загрузки черновиков событий:', error);
      }
    };

    loadPendingEvents();

    // Подписываемся на изменения черновиков
    const interval = setInterval(loadPendingEvents, 10000); // Обновляем каждые 10 секунд

    return () => {
      clearInterval(interval);
    };
  }, [user?.id]);
  
  // Фильтрация событий по выбранным регионам
  const filteredEvents = useMemo(() => {
    // Объединяем обычные события с черновиками
    const allEvents = [...realEvents, ...pendingEventDrafts];
    
    if (selectedRegions.length === 0) {
      // Если регионы не выбраны, показываем все события
      return allEvents;
    }
    
    return allEvents.filter(event => {
      // Если у события есть location, пытаемся определить регион
      if (event.location) {
        const eventRegionId = getRegionIdByName(event.location);
        if (eventRegionId && selectedRegions.includes(eventRegionId)) {
          return true;
        }
      }
      
      // Если регион не определен, но есть координаты, можно использовать геокодирование
      // Пока оставляем событие, если регион не определен (для производительности)
      // В будущем можно добавить кеширование регионов по координатам
      return false;
    });
  }, [realEvents, pendingEventDrafts, selectedRegions]);
  
  // Используем внешний viewMode для всех режимов
  const calendarViewMode = externalViewMode;
  
  // Обработчик изменения режима
  const handleViewModeChange = (mode: 'day' | 'week' | 'month' | 'year') => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  // Если передан selectedEventId, выделяем это событие
  useEffect(() => {
    if (selectedEventId && filteredEvents.length > 0) {
      const eventToSelect = filteredEvents.find((event: MockEvent) => event.id.toString() === selectedEventId);
      if (eventToSelect) {
        setSelectedEvent(eventToSelect);
        setShowEventsModal(true);
      }
    }
  }, [selectedEventId, filteredEvents]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getEvents();

        // Геокодируем события без координат
        const mapped: MockEvent[] = await Promise.all(data.map(async (e: any) => {
          const startDate = formatDateKey(e.start_datetime);
          const endDate = e.end_datetime ? formatDateKey(e.end_datetime) : undefined;
          const categoryId = pickCategoryId(e);

          let latitude = e.latitude;
          let longitude = e.longitude;

          // Если координаты отсутствуют, но есть location, пытаемся геокодировать
          if ((latitude == null || longitude == null) && e.location) {
            try {
              const { geocodeAddress } = await import('../../services/geocodingService');
              const geocoded = await geocodeAddress(e.location);
              if (geocoded && geocoded.latitude && geocoded.longitude) {
                latitude = geocoded.latitude;
                longitude = geocoded.longitude;
              }
            } catch (err) {
              // Если геокодинг не удался, оставляем null
            }
          }

          // Если координаты все еще отсутствуют, используем NaN
          // События без координат не будут отображаться на карте
          if (latitude == null || longitude == null) {
            latitude = NaN;
            longitude = NaN;
          }

          return {
          id: Number(e.id) || Math.abs(hashCode(e.id)),
          title: e.title,
          description: e.description || '',
            date: startDate,
            endDate: endDate && endDate !== startDate ? endDate : undefined, // Только если даты разные
          categoryId: categoryId,
          hashtags: Array.isArray(e.hashtags) ? e.hashtags : [],
            location: e.location || '',
            latitude: latitude,
            longitude: longitude
          };
        }));

        if (isMounted) setRealEvents(mapped);
      } catch (err) {
        // тихий фоллбек на моки
        if (isMounted) setRealEvents([]);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  function getEventsForDate(day: number | null, current: Date): MockEvent[] {
    if (!day) return [];
    const dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const all = [...filteredEvents, ...mockEvents];
    return all.filter((event: MockEvent) => {
      // Проверяем, попадает ли дата в диапазон события (для многодневных событий)
      if (event.date === dateKey) return true;
      if (event.endDate) {
        const eventStart = new Date(event.date);
        const eventEnd = new Date(event.endDate);
        const checkDate = new Date(dateKey);
        return checkDate >= eventStart && checkDate <= eventEnd;
      }
      return false;
    });
  }

  // Группировка событий по категориям
  function groupEventsByCategory(events: MockEvent[]): { categoryId: string; events: MockEvent[]; category: typeof categories[0] }[] {
    const grouped: { [key: string]: MockEvent[] } = {};
    
    events.forEach(event => {
      const categoryId = event.categoryId || 'festival';
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(event);
    });

    return Object.entries(grouped).map(([categoryId, events]) => {
      const category = getCategoryById(categoryId) || categories[0];
      return { categoryId, events, category };
    });
  }

  // Обработчик клика на иконку категории
  const handleCategoryIconClick = (e: React.MouseEvent, categoryId: string, events: MockEvent[], day: number, current: Date) => {
    e.stopPropagation();
    const dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedCategoryEvents({ categoryId, events, date: dateKey });
  };

  function hashCode(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return h;
  }

  // Интеграция с eventsStore
  const addOpenEvent = useEventsStore((state) => state.addOpenEvent);
  const setSelectedEventInStore = useEventsStore((state) => state.setSelectedEvent);

  const handleDateClick = (day: number | null, month?: number, year?: number) => {
    if (!day) return;
    const clickedDate = new Date(
      year !== undefined ? year : currentDate.getFullYear(),
      month !== undefined ? month : currentDate.getMonth(),
      day
    );
    setSelectedDate(clickedDate);
    const events = getEventsForDate(day, month !== undefined && year !== undefined 
      ? new Date(year, month, 1) 
      : currentDate);
    if (events.length > 0) {
      setArchiveEvents(events);
      setShowEventsModal(true);
      
      // Добавляем все события в открытые (для отображения на карте)
      events.forEach(event => {
        addOpenEvent(event);
      });
      
      // Устанавливаем первое событие как выбранное
      if (events.length > 0) {
        setSelectedEventInStore(events[0]);
      }
    }
  };

  const handleDateHover = (day: number | null, events: MockEvent[]) => {
    if (!day || events.length === 0) {
      setHoveredDate(null);
      return;
    }
    setHoveredDate({ day, events });
  };

  const handleExternalEventClick = (event: ExternalEvent) => {
    // КРИТИЧНО: Событие добавляется в openEvents ТОЛЬКО при нажатии "Открыть детали"
    // Это происходит в EventDetailPage или в кнопке "Открыть детали" в EventsListModal
    const mockEvent: MockEvent = {
      id: parseInt(event.id),
      title: event.title,
      description: event.description || '',
      date: event.start_date,
      categoryId: event.category || 'festival',
      hashtags: [],
      location: event.location?.address || '',
      // Используем координаты из события, если они есть, иначе NaN (не отображаем на карте)
      latitude: event.location?.latitude != null ? event.location.latitude : NaN,
      longitude: event.location?.longitude != null ? event.location.longitude : NaN
    };
    setSelectedEvent(mockEvent);
    setShowEventsModal(false);
    
    // НЕ добавляем событие в openEvents здесь - это делается только при нажатии "Открыть детали"
    // Просто устанавливаем выбранное событие для отображения деталей
    setSelectedEventInStore(mockEvent);
  };

  const adaptMockEventToExternal = (event: MockEvent): ExternalEvent => ({
    id: event.id.toString(),
    title: event.title,
    description: event.description || '',
    start_date: event.date,
    end_date: event.date,
    location: { address: event.location || '' },
    source: 'local',
    category: event.categoryId,
    url: '',
    image_url: '',
    attendees_count: undefined,
    price: undefined,
    organizer: undefined
  });

  const handleViewAllEvents = () => {
    setShowEventsModal(true);
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setShowArchive(false);
  };

  const navigateYear = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + direction);
    setCurrentDate(newDate);
    setShowArchive(false);
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
    setShowArchive(false);
  };

  const navigateDay = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
    setShowArchive(false);
  };

  const handlePrevPeriod = () => {
    if (calendarViewMode === 'month') {
      navigateMonth(-1);
    } else if (calendarViewMode === 'year') {
      navigateYear(-1);
    } else if (calendarViewMode === 'week') {
      navigateWeek(-1);
    } else {
      navigateDay(-1);
    }
  };

  const handleNextPeriod = () => {
    if (calendarViewMode === 'month') {
      navigateMonth(1);
    } else if (calendarViewMode === 'year') {
      navigateYear(1);
    } else if (calendarViewMode === 'week') {
      navigateWeek(1);
    } else {
      navigateDay(1);
    }
  };

  const handleMonthClick = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    handleViewModeChange('month');
  };
  
  // Получить название текущего периода в зависимости от режима
  const getCurrentPeriodName = () => {
    if (calendarViewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (calendarViewMode === 'year') {
      return `${currentDate.getFullYear()}`;
    } else if (calendarViewMode === 'week') {
      const today = currentDate;
      const day = today.getDay();
      const diff = today.getDate() - (day === 0 ? 6 : day - 1);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(diff);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else { // day
      return selectedDate 
        ? selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
        : currentDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  // Функция для получения дней месяца для отображения года
  const getDaysForYearView = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startDate = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const days: (number | null)[] = [];
    for (let i = 0; i < startDate; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);
    return days;
  };

  const toggleFavorite = (event: MockEvent) => {
    if (!favorites) return;
    const id = event.id.toString();
    if (favorites.isEventFavorite(id)) {
      favorites.removeFavoriteEvent(id);
    } else {
      favorites.addFavoriteEvent({
        id,
        title: event.title,
        date: event.date,
        location: event.location || '',
        latitude: event.latitude || 0,
        longitude: event.longitude || 0,
        category: event.categoryId || 'other',
        purpose: 'personal',
        tags: [],
        visibility: 'private',
        usageCount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  };

  const isFavorite = (event: MockEvent) => {
    if (!favorites) return false;
    return favorites.isEventFavorite(event.id.toString());
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex gap-4 h-full">
        {/* Календарь - растянут на весь размер */}
        <div className={`${showArchive ? 'w-2/3' : 'w-full'} transition-all duration-300 h-full flex flex-col`}>
          <div className="shadow-lg rounded-xl deep-card travel-calendar-container h-full flex flex-col relative">
            <div className="p-4 flex-1 flex flex-col relative z-10">
              {/* Единая панель навигации: название периода слева, кнопки настроек в центре, переключатели справа */}
              <div className="calendar-navigation-panel mb-4">
                <div className="calendar-period-name">
                  <button
                    type="button"
                    className="calendar-period-nav-btn"
                    onClick={handlePrevPeriod}
                    aria-label="Предыдущий период"
                  >
                    <Icon icon={arrowLeftThick} size={20} />
                  </button>
                  <span className="calendar-period-text">
                    {getCurrentPeriodName()}
                  </span>
                  <button
                    type="button"
                    className="calendar-period-nav-btn"
                    onClick={handleNextPeriod}
                    aria-label="Следующий период"
                  >
                    <Icon icon={arrowRightThick} size={20} />
                  </button>
                </div>
                <div className="calendar-settings-buttons">
                  <button
                    type="button"
                    className="calendar-settings-btn"
                    onClick={onAddEventClick || (() => {})}
                    aria-label="Добавить событие"
                    title="Добавить событие"
                  >
                    <CalendarPlus size={20} />
                  </button>
                  <button
                    type="button"
                    className="calendar-settings-btn"
                    onClick={onSearchClick || (() => {})}
                    aria-label="Поиск и настройки"
                    title="Поиск и настройки"
                  >
                    <Settings size={20} />
                  </button>
                  <button
                    type="button"
                    className="calendar-settings-btn"
                    onClick={onLegendClick || (() => {})}
                    aria-label="Легенда"
                    title="Легенда"
                  >
                    <HelpCircle size={20} />
                  </button>
                </div>
                <div className="calendar-view-switcher">
                  <button
                    onClick={() => handleViewModeChange('day')}
                    className={`view-mode-btn ${calendarViewMode === 'day' ? 'active' : ''}`}
                    aria-label="Режим дня"
                  >
                    День
                  </button>
                  <button
                    onClick={() => handleViewModeChange('week')}
                    className={`view-mode-btn ${calendarViewMode === 'week' ? 'active' : ''}`}
                    aria-label="Режим недели"
                  >
                    Неделя
                  </button>
                <button
                    onClick={() => handleViewModeChange('month')}
                    className={`view-mode-btn ${calendarViewMode === 'month' ? 'active' : ''}`}
                    aria-label="Режим месяца"
                >
                    Месяц
                </button>
                <button
                    onClick={() => handleViewModeChange('year')}
                    className={`view-mode-btn ${calendarViewMode === 'year' ? 'active' : ''}`}
                    aria-label="Режим года"
                >
                    Год
                </button>
                </div>
              </div>

              {/* Отображение в зависимости от режима календаря */}
              {calendarViewMode === 'month' ? (
                <>
              {/* Дни недели */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-xs font-bold text-white py-1.5 calendar-weekday-header">
                    {day}
                  </div>
                ))}
              </div>

              {/* Дни месяца - правильная сетка */}
              <div className="grid grid-cols-7 gap-1 flex-1" style={{ gridAutoRows: 'minmax(100px, 1fr)' }}>
                {getDaysInMonth(currentDate).map((day, index) => {
                  const events = getEventsForDate(day, currentDate);
                  const hasEvents = events.length > 0;

                  return (
                    <div
                      key={index}
                          className={`travel-calendar-day-cell p-1.5 cursor-pointer relative ${
                            day ? '' : 'empty'
                          } ${hasEvents ? 'has-events' : ''} ${
                            day && selectedDate && 
                            selectedDate.getDate() === day && 
                            selectedDate.getMonth() === currentDate.getMonth() && 
                            selectedDate.getFullYear() === currentDate.getFullYear() 
                              ? 'selected' : ''
                          }`}
                      onClick={() => handleDateClick(day)}
                      onMouseEnter={() => handleDateHover(day, events)}
                      onMouseLeave={() => setHoveredDate(null)}
                    >
                      {day && (
                        <>
                              <div className="day-number">{day}</div>

                          {/* Внутри ячейки показываем события только иконками категорий по аккуратному правилу */}
                          {hasEvents && (() => {
                            const groupedCategories = groupEventsByCategory(events);
                            const MAX_ICONS_PER_DAY = 5;

                            // Плоский список иконок (категория + событие)
                            const iconItems: {
                              categoryId: string;
                              category: typeof categories[0];
                              event: MockEvent;
                            }[] = [];

                            groupedCategories.forEach(({ categoryId, events: categoryEvents, category }) => {
                              categoryEvents.forEach((event) => {
                                if (iconItems.length < MAX_ICONS_PER_DAY) {
                                  iconItems.push({ categoryId, category, event });
                                }
                              });
                            });

                            const totalEventsCount = events.length;
                            const extraCount = totalEventsCount - iconItems.length;

                            const colorMap: { [key: string]: string } = {
                              'bg-red-500': '#ef4444',
                              'bg-orange-500': '#f97316',
                              'bg-sky-500': '#0ea5e9',
                              'bg-emerald-500': '#10b981',
                              'bg-violet-500': '#8b5cf6',
                              'bg-amber-500': '#f59e0b',
                              'bg-pink-500': '#ec4899',
                              'bg-fuchsia-500': '#d946ef',
                              'bg-indigo-500': '#6366f1',
                              'bg-lime-500': '#84cc16',
                              'bg-cyan-500': '#06b6d4',
                              'bg-yellow-400': '#facc15',
                              'bg-rose-500': '#f43f5e',
                              'bg-purple-600': '#9333ea',
                              'bg-purple-500': '#a855f7',
                              'bg-orange-400': '#fb923c',
                              'bg-teal-500': '#14b8a6',
                              'bg-blue-400': '#60a5fa',
                              'bg-neutral-800': '#262626'
                            };

                            return (
                              <div className="flex flex-wrap gap-1 items-center justify-start overflow-hidden">
                                {iconItems.map(({ categoryId, category, event }) => {
                                  const Icon = (category?.icon as any) || PartyPopper;
                                  const categoryColor = category?.color ? (colorMap[category.color] || '#6b7280') : '#6b7280';

                                  const isMultiDay = event.endDate && event.endDate !== event.date;
                                  const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                  const isStartDay = event.date === dateKey;
                                  const isEndDay = event.endDate === dateKey;

                                  return (
                                    <button
                                      key={`${categoryId}-${event.id}`}
                                      type="button"
                                      className="relative cursor-pointer group focus:outline-none"
                                      onClick={(e) => handleCategoryIconClick(e, categoryId, groupedCategories.find(gc => gc.categoryId === categoryId)?.events || [], day, currentDate)}
                                      title={`${category.name}: ${event.title}`}
                                    >
                                      <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 border-2 border-white/40 hover:scale-110 backdrop-blur-sm"
                                        style={{
                                          background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%)`,
                                          borderColor: 'rgba(255, 255, 255, 0.5)'
                                        }}
                                      >
                                        <Icon className="w-3.5 h-3.5 text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
                                      </div>
                                      {/* Индикаторы многодневных событий */}
                                      {isMultiDay && isStartDay && (
                                        <div className="absolute -right-1 -top-1 w-2 h-2 bg-white rounded-full border border-gray-300"></div>
                                      )}
                                      {isMultiDay && isEndDay && (
                                        <div className="absolute -left-1 -top-1 w-2 h-2 bg-white rounded-full border border-gray-300"></div>
                                      )}
                                    </button>
                                  );
                                })}

                                {extraCount > 0 && (
                                  <button
                                    type="button"
                                    className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/30 text-white shadow-sm backdrop-blur-sm border border-white/40 hover:bg-white/50 transition-colors"
                                    onClick={(e) => {
                                      // Открываем модалку со всеми событиями этого дня
                                      e.stopPropagation();
                                      setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                                      setShowEventsModal(true);
                                    }}
                                  >
                                    +{extraCount}
                                  </button>
                                )}
                              </div>
                            );
                          })()}

                          {/* Мини-модальное окно при наведении */}
                          {hoveredDate && hoveredDate.day === day && (
                            <Suspense fallback={<div className="text-center p-2">Загрузка...</div>}>
                              <LazyEventPreviewTooltip
                                events={events.map(adaptMockEventToExternal)}
                                date={`${day} ${monthNames[currentDate.getMonth()]}`}
                                onEventClick={handleExternalEventClick}
                                onViewAll={handleViewAllEvents}
                              />
                            </Suspense>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
                </>
              ) : calendarViewMode === 'week' ? (
                /* Режим недели - горизонтальная лента с днями текущей недели */
                <div className="flex-1 overflow-x-auto">
                  <div className="flex gap-2 h-full min-w-full">
                    {(() => {
                      const startOfWeek = new Date(currentDate);
                      const day = startOfWeek.getDay();
                      const diff = startOfWeek.getDate() - (day === 0 ? 6 : day - 1);
                      startOfWeek.setDate(diff);
                      
                      return Array.from({ length: 7 }, (_, i) => {
                        const weekDay = new Date(startOfWeek);
                        weekDay.setDate(startOfWeek.getDate() + i);
                        const events = getEventsForDate(weekDay.getDate(), weekDay);
                        const isSelected = selectedDate && 
                          selectedDate.getDate() === weekDay.getDate() &&
                          selectedDate.getMonth() === weekDay.getMonth() &&
                          selectedDate.getFullYear() === weekDay.getFullYear();
                        
                        return (
                          <div 
                            key={i} 
                            className={`flex-1 travel-calendar-day-cell p-3 cursor-pointer ${isSelected ? 'selected' : ''} ${events.length > 0 ? 'has-events' : ''}`}
                            onClick={() => handleDateClick(weekDay.getDate())}
                          >
                            <div className="text-xs font-medium text-gray-500 mb-1">
                              {weekDays[i]}
                            </div>
                            <div className="day-number text-lg font-bold mb-2">
                              {weekDay.getDate()}
                            </div>
                            <div className="space-y-1">
                              {events.slice(0, 5).map((event: MockEvent) => {
                                const category = getCategoryById(event.categoryId)!;
                                const Icon = (category?.icon as any) || PartyPopper;
                                const isPending = (event as any).isPending || (event as any).status === 'pending';
                                return (
                                  <div 
                                    key={event.id} 
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[9px] font-semibold text-white ${isPending ? 'bg-orange-500' : (category?.color || 'bg-gray-500')}`}
                                    title={event.title + (isPending ? ' (На модерации)' : '')}
                                  >
                                    <Icon className="w-2.5 h-2.5" />
                                    <span className="truncate">{event.title}</span>
                                    {isPending && <span className="ml-1">⏳</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              ) : calendarViewMode === 'day' ? (
                /* Режим дня - детальная разбивка событий на выбранный день */
                <div className="flex-1 overflow-y-auto">
                  {selectedDate ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold mb-1">
                          {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {weekDays[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]}
                        </p>
                      </div>
                      <div className="space-y-3">
                        {(() => {
                          const events = getEventsForDate(selectedDate.getDate(), selectedDate);
                          if (events.length === 0) {
                            return (
                              <div className="text-center text-gray-500 py-8">
                                Нет событий на этот день
                              </div>
                            );
                          }
                          return events.map((event: MockEvent) => {
                            const category = getCategoryById(event.categoryId)!;
                            const Icon = (category?.icon as any) || PartyPopper;
                            return (
                              <div 
                                key={event.id}
                                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleExternalEventClick(adaptMockEventToExternal(event))}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-lg ${category?.color || 'bg-gray-500'}`}>
                                    <Icon className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                                    {event.description && (
                                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                                    )}
                                    {event.location && (
                                      <p className="text-xs text-gray-500">{event.location}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Выберите день для просмотра событий
                    </div>
                  )}
                </div>
              ) : (
                /* Режим просмотра всего года */
                <div className="grid grid-cols-3 gap-4 flex-1 overflow-y-auto">
                  {monthNames.map((monthName, monthIndex) => {
                    const year = currentDate.getFullYear();
                    const days = getDaysForYearView(year, monthIndex);
                    const monthDate = new Date(year, monthIndex, 1);
                    
                    return (
                      <div key={monthIndex} className="flex flex-col">
                        <h3 
                          className="text-sm font-bold text-gray-800 mb-2 cursor-pointer hover:text-blue-600"
                          onClick={() => handleMonthClick(monthIndex)}
                        >
                          {monthName}
                        </h3>
                        <div className="grid grid-cols-7 gap-0.5">
                          {/* Дни недели */}
                          {weekDays.map((day) => (
                            <div key={day} className="text-center text-[10px] font-medium text-gray-600 py-0.5">
                              {day}
                            </div>
                          ))}
                          {/* Дни месяца */}
                          {days.map((day, dayIndex) => {
                            const events = day ? getEventsForDate(day, monthDate) : [];
                            const hasEvents = events.length > 0;
                            const isWeekend = day && (dayIndex % 7 === 5 || dayIndex % 7 === 6);
                            
                            return (
                              <div
                                key={dayIndex}
                                className={`travel-calendar-day-cell-year p-0.5 cursor-pointer relative text-center ${
                                  day ? '' : 'empty'
                                } ${hasEvents ? 'has-events' : ''} ${isWeekend ? 'weekend' : ''}`}
                                onClick={() => {
                                  if (day) {
                                    handleMonthClick(monthIndex);
                                    setTimeout(() => {
                                      const clickedDate = new Date(year, monthIndex, day);
                                      setSelectedDate(clickedDate);
                                      const dayEvents = getEventsForDate(day, monthDate);
                                      if (dayEvents.length > 0) {
                                        setArchiveEvents(dayEvents);
                                        setShowEventsModal(true);
                                      }
                                    }, 100);
                                  }
                                }}
                              >
                                {day && (
                                  <div className={`text-[10px] font-medium ${isWeekend ? 'text-red-600' : 'text-gray-700'}`}>
                                    {day}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Архив событий */}
        {showArchive && (
          <div className="w-1/3 transition-all duration-300">
            <div className="shadow-lg rounded-xl deep-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    Архив событий
                  </h3>
                  <button
                    onClick={() => setShowArchive(false)}
                    className="hover:bg-gray-100 rounded-full p-2"
                    aria-label="Закрыть архив"
                  >
                    ✕
                  </button>
                </div>

                {selectedDate && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      {selectedDate.toLocaleDateString('ru-RU', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {archiveEvents.length > 0 ? (
                    archiveEvents.map((event: MockEvent) => {
                      const category = getCategoryById(event.categoryId)!;
                      const IconComponent = (category?.icon as any) || PartyPopper;
                      const fav = isFavorite(event);
                      return (
                        <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full ${category?.color || 'bg-gray-500'} flex items-center justify-center flex-shrink-0`}>
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-800 mb-1">{event.title}</h4>
                                <button
                                  className={`text-xs px-2 py-1 rounded border ${fav ? 'border-yellow-500 text-yellow-600' : 'border-gray-300 text-gray-600'} hover:bg-gray-50`}
                                  onClick={() => toggleFavorite(event)}
                                >
                                  {fav ? '★ В избранном' : '☆ В избранное'}
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                              <div className="flex gap-2 mb-2">
                                {event.hashtags.map((tag: string, index: number) => (
                                  <span key={index} className="inline-block bg-gray-100 text-gray-600 rounded px-2 py-0.5 text-xs">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  className="bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-1 flex items-center text-xs"
                                  onClick={() => {/* TODO: присоединение */}}
                                >
                                  <Users className="w-3 h-3 mr-1" />
                                  Присоединиться
                                </button>
                                <button
                                  className="border border-green-600 text-green-600 hover:bg-green-50 rounded px-2 py-1 flex items-center text-xs"
                                  onClick={() => {/* TODO: поделиться */}}
                                >
                                  <Share2 className="w-3 h-3 mr-1" />
                                  Поделиться
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>На эту дату событий нет</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно со списком событий */}
        <Suspense fallback={<div className="text-center p-4">Загрузка модального окна...</div>}>
          <LazyEventsListModal
            isOpen={showEventsModal}
            onClose={() => setShowEventsModal(false)}
                       events={archiveEvents.map(adaptMockEventToExternal)}
            date={selectedDate ? selectedDate.toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) : ''}
                       onEventClick={handleExternalEventClick}
          />
        </Suspense>

        {/* Модальное окно для событий категории */}
        {selectedCategoryEvents && (
          <Suspense fallback={<div className="text-center p-4">Загрузка событий категории...</div>}>
            <LazyEventsListModal
              isOpen={true}
              onClose={() => setSelectedCategoryEvents(null)}
              events={selectedCategoryEvents.events.map(adaptMockEventToExternal)}
              date={new Date(selectedCategoryEvents.date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
              onEventClick={handleExternalEventClick}
            />
          </Suspense>
        )}

        {/* Детальная страница события */}
        {selectedEvent && (
          <Suspense fallback={<div className="text-center p-4">Загрузка деталей события...</div>}>
            <LazyEventDetailPage
              event={adaptMockEventToExternal(selectedEvent)}
              onClose={() => {
                setShowEventsModal(false);
                setSelectedEvent(null);
              }}
              onBack={() => {
                setShowEventsModal(false);
                setSelectedEvent(null);
                setShowEventsModal(true);
              }}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default TravelCalendar;
