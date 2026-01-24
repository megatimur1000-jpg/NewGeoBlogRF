import { useState, useCallback } from 'react';
import { EventType } from '../types/event';
import { createMarkerFromContent } from '../services/markerService';
import { ContentSource } from '../types';
import apiClient from '../api/apiClient';

interface Integrations {
  mapMarkerId?: string;
  chatRoomId?: string;
  blogId?: string;
}

export const useIntegrations = () => {
  const [loading, setLoading] = useState(false);
  const [availableRoutes] = useState([
    { id: 'route1', name: 'Маршрут по Карелии', distance: '45 км' },
    { id: 'route2', name: 'Восхождение на Эльбрус', distance: '12 км' },
    { id: 'route3', name: 'Поход по Алтаю', distance: '78 км' }
  ]);

  const createMapMarker = useCallback(
    async (
      location: { address: string; coordinates: { lat: number; lng: number } },
      eventData?: EventType
    ) => {
      const content: ContentSource = {
        id: '', // пусть сервер генерирует
        type: 'other',
        title: eventData?.title || 'Метка',
        location: {
          latitude: location.coordinates.lat,
          longitude: location.coordinates.lng
        },
        creatorId: '', // если не нужен — уберите
        description: eventData?.description || ''
      };
      const marker = await createMarkerFromContent(content);
      return marker.id;
    },
    []
  );

  const createChatRoom = useCallback(async (eventData: EventType) => {
    try {
      const response = await apiClient.post('/chat/rooms', {
        name: `Чат: ${eventData.title}`,
        eventId: eventData.id,
        type: 'event'
      });
      return response.data.id;
    } catch (error) {
      throw error;
    }
  }, []);

  const publishToActivity = useCallback(async (eventData: EventType) => {
    try {
      await apiClient.post('/activity', {
        type: 'event_created',
        eventId: eventData.id,
        title: eventData.title,
        description: eventData.description
      });
      return true;
    } catch (error) {
      throw error;
    }
  }, []);

  const createBlogPost = useCallback(async (eventData: EventType) => {
    try {
      const response = await apiClient.post('/blog/posts', {
        title: `Отчет: ${eventData.title}`,
        content: eventData.description,
        eventId: eventData.id,
        tags: eventData.metadata?.tags || []
      });
      return response.data.id;
    } catch (error) {
      throw error;
    }
  }, []);

  const createIntegratedEvent = useCallback(
    async (eventData: EventType) => {
      setLoading(true);

      try {
        const integrations: Integrations = {};

        // Create map marker
        if (
          eventData.location.address &&
          eventData.location.coordinates &&
          typeof eventData.location.coordinates.lat === 'number' &&
          typeof eventData.location.coordinates.lng === 'number'
        ) {
          integrations.mapMarkerId = await createMapMarker(
            {
              address: eventData.location.address,
              coordinates: eventData.location.coordinates
            },
            eventData
          );
        }

        // Create chat room
        integrations.chatRoomId = await createChatRoom(eventData);

        // Publish to activity feed
        await publishToActivity(eventData);

        // If event is completed, create blog post
        if (eventData.status === 'completed') {
          const blogId = await createBlogPost(eventData);
          integrations.blogId = blogId ?? undefined;
        }

        return {
          ...eventData,
          integrations
        };
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [createMapMarker, createChatRoom, publishToActivity, createBlogPost]
  );

  const openInModule = useCallback(
    (moduleType: 'chat' | 'map' | 'route' | 'blog', id: string) => {
      // Здесь можно добавить навигацию к соответствующим модулям
      switch (moduleType) {
        case 'chat':
          window.location.href = `/chat?room=${id}`;
          break;
        case 'map':
          window.location.href = `/map?marker=${id}`;
          break;
        case 'route':
          window.location.href = `/routes?route=${id}`;
          break;
        case 'blog':
          window.location.href = `/blog/${id}`;
          break;
        default:
          }
    },
    []
  );

  return {
    loading,
    availableRoutes,
    createIntegratedEvent,
    openInModule,
    createMapMarker,
    createChatRoom,
    publishToActivity,
    createBlogPost
  };
};
