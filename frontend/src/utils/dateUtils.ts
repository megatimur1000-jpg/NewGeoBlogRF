import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { EventType } from 'types/event';

export const formatDateRange = (dateRange: { start: string | Date; end: string | Date }) => {
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  
  const startDate = format(start, 'd MMM', { locale: ru });
  const endDate = format(end, 'd MMM yyyy', { locale: ru });
  
  if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
    return format(start, 'd MMMM yyyy', { locale: ru });
  }
  
  return `${startDate} - ${endDate}`;
};

export const formatRelativeTime = (date: string | Date) => {
  const targetDate = new Date(date);
  
  if (isToday(targetDate)) {
    return 'Сегодня';
  }
  
  if (isTomorrow(targetDate)) {
    return 'Завтра';
  }
  
  if (isYesterday(targetDate)) {
    return 'Вчера';
  }
  
  return formatDistanceToNow(targetDate, { 
    addSuffix: true, 
    locale: ru 
  });
};

export const getEventStatus = (event: EventType) => {
  const now = new Date();
  const start = new Date(event.dateRange.start);
  const end = new Date(event.dateRange.end);
  
  if (now < start) {
    return 'planning';
  } else if (now >= start && now <= end) {
    return 'active';
  } else {
    return 'completed';
  }
};

export const getDaysUntilEvent = (eventDate: string | Date) => {
  const now = new Date();
  const event = new Date(eventDate);
  const diffTime = event.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const getEventDuration = (dateRange: { start: string | Date; end: string | Date }) => {
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return '1 день';
  } else if (diffDays < 5) {
    return `${diffDays} дня`;
  } else {
    return `${diffDays} дней`;
  }
};