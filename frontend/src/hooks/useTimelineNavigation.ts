import { useState, useMemo, useCallback } from 'react';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  addWeeks,
  addMonths,
  isWithinInterval
} from 'date-fns';
import { EventType } from 'types/event';

export const useTimelineNavigation = (events: EventType[]) => {
  const [currentPeriod, setCurrentPeriod] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const getPeriodBounds = useCallback((date: Date, mode: string) => {
    switch (mode) {
      case 'week':
        return {
          start: startOfWeek(date, { weekStartsOn: 1 }),
          end: endOfWeek(date, { weekStartsOn: 1 })
        };
      case 'month':
        return {
          start: startOfMonth(date),
          end: endOfMonth(date)
        };
      default:
        return {
          start: startOfMonth(date),
          end: endOfMonth(date)
        };
    }
  }, []);

  const navigatePeriod = useCallback((direction: 'prev' | 'next' | 'today') => {
    setCurrentPeriod(prev => {
      switch (direction) {
        case 'prev':
          switch (viewMode) {
            case 'week':
              return addWeeks(prev, -1);
            case 'month':
              return addMonths(prev, -1);
            default:
              return prev;
          }
        case 'next':
          switch (viewMode) {
            case 'week':
              return addWeeks(prev, 1);
            case 'month':
              return addMonths(prev, 1);
            default:
              return prev;
          }
        case 'today':
          return new Date();
        default:
          return prev;
      }
    });
  }, [viewMode]);

  const filteredEvents = useMemo(() => {
    const bounds = getPeriodBounds(currentPeriod, viewMode);
    
    return events.filter(event => {
      const eventStart = new Date(event.dateRange.start);
      const eventEnd = new Date(event.dateRange.end);
      
      // Check if event overlaps with current period
      return isWithinInterval(eventStart, bounds) || 
             isWithinInterval(eventEnd, bounds) ||
             (eventStart <= bounds.start && eventEnd >= bounds.end);
    }).sort((a, b) => new Date(a.dateRange.start).getTime() - new Date(b.dateRange.start).getTime());
  }, [events, currentPeriod, viewMode, getPeriodBounds]);

  const periodStats = useMemo(() => {
    return {
      totalEvents: filteredEvents.length,
      activeEvents: filteredEvents.filter(e => e.status === 'active').length,
      planningEvents: filteredEvents.filter(e => e.status === 'planning').length,
      completedEvents: filteredEvents.filter(e => e.status === 'completed').length
    };
  }, [filteredEvents]);

  return {
    currentPeriod,
    viewMode,
    setViewMode,
    navigatePeriod,
    filteredEvents,
    periodStats,
    getPeriodBounds
  };
};