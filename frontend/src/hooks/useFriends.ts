import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { friendsApi } from '../api/friendsApi';
import { Friend } from '../types/friends';

export const useFriends = () => {
  const auth = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFriends = async () => {
      if (!auth?.user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const friendsData = await friendsApi.getFriends(auth.user.id);
        setFriends(friendsData);
      } catch (err) {
        setError('Ошибка загрузки друзей');
        setFriends([]);
        // Загрузка тестовых данных при ошибке API
        setFriends([
          {
            id: '1',
            username: 'Алексей_Путешественник',
            email: 'alexey@example.com',
            avatar_url: undefined,
            friendship_id: '1',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 дней назад
            status: 'online'
          },
          {
            id: '2',
            username: 'Мария_Фотограф',
            email: 'maria@example.com',
            avatar_url: undefined,
            friendship_id: '2',
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 дней назад
            status: 'online'
          },
          {
            id: '3',
            username: 'Дмитрий_Эксперт',
            email: 'dmitry@example.com',
            avatar_url: undefined,
            friendship_id: '3',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 дней назад
            status: 'recently'
          },
          {
            id: '4',
            username: 'Анна_Блогер',
            email: 'anna@example.com',
            avatar_url: undefined,
            friendship_id: '4',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 дня назад
            status: 'recently'
          },
          {
            id: '5',
            username: 'Сергей_Картограф',
            email: 'sergey@example.com',
            avatar_url: undefined,
            friendship_id: '5',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 день назад
            status: 'offline'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadFriends();
  }, [auth?.user?.id]);

  const refetch = () => {
    if (auth?.user?.id) {
      loadFriends();
    }
  };

  return {
    friends,
    loading,
    error,
    refetch
  };
};
