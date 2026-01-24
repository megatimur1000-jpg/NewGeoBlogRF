import { useState, useEffect, useCallback } from 'react';
import { EventType } from 'types/event';
import apiClient from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { activityService } from '../services/activityService';

export const useEventState = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authContext = useAuth(); // Используем ваш AuthContext
  const user = authContext?.user;

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/events');
        setEvents(response.data);
      } catch (err) {
        setError('Ошибка загрузки событий');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const createEvent = useCallback(async (eventData: EventType) => {
    setLoading(true);
    setError(null);
    
    try {
      // Проверяем, является ли пользователь админом
      let isAdmin = false;
      try {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          isAdmin = user?.role === 'admin';
        }
      } catch (e) {
        // Игнорируем ошибку парсинга
      }

      // Для не-админов сохраняем локально на модерацию
      if (!isAdmin && user) {
        const { savePendingContent } = await import('../services/localModerationStorage');
        const { analyzeContentWithAI } = await import('../services/aiModerationService');
        
        const pendingId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const authorName = user?.username || user?.email || 'Пользователь';
        const authorId = user?.id;

        // Сохраняем локально
        savePendingContent({
          id: pendingId,
          type: 'event',
          data: eventData,
          created_at: new Date().toISOString(),
          author_id: authorId,
          author_name: authorName,
        });

        // Запускаем ИИ-анализ асинхронно
        analyzeContentWithAI('event', pendingId, eventData).catch(err => 
          console.error('Ошибка ИИ-анализа события:', err)
        );

        // Возвращаем событие с флагом "на модерации"
        return {
          ...eventData,
          id: pendingId,
          status: 'pending',
          is_pending: true,
        } as EventType;
      }

      // Для админов сохраняем сразу в БД
      const response = await apiClient.post('/events', eventData);
      const createdEvent = response.data;
      
      // Создаем активность для создания события
      await activityService.createActivityHelper(
        'event_created',
        'event',
        createdEvent.id,
        {
          title: createdEvent.title,
          category: createdEvent.category,
          startDate: createdEvent.startDate,
          location: createdEvent.location
        }
      );
      
      return createdEvent;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<EventType>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.put(`/events/${eventId}`, updates);
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, ...response.data }
          : event
      ));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const joinEvent = useCallback(async (eventId: string, userId: string) => {
    try {
      const response = await apiClient.post(`/events/${eventId}/join`, { userId });
      setEvents(prev => prev.map(event => 
        event.id === eventId ? response.data : event
      ));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const leaveEvent = useCallback(async (eventId: string, userId: string) => {
    try {
      const response = await apiClient.post(`/events/${eventId}/leave`, { userId });
      setEvents(prev => prev.map(event => 
        event.id === eventId ? response.data : event
      ));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.delete(`/events/${eventId}`);
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Computed values
  const activeEvents = events.filter(event => 
    event.status === 'planning' || event.status === 'active'
  );
  
  const completedEvents = events.filter(event => 
    event.status === 'completed' || event.status === 'archived'
  );
  
  const myEvents = events.filter(event => {
    if (!user) return false; // Если пользователь не авторизован
    return event.participants.organizer === user.id || 
           event.participants.members.includes(user.id);
  });

  return {
    events,
    activeEvents,
    completedEvents,
    myEvents,
    loading,
    error,
    createEvent,
    updateEvent,
    joinEvent,
    leaveEvent,
    deleteEvent
  };
};