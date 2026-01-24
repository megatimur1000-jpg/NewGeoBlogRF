import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { activityService, ActivityItem, ActivityFilters as ActivityFiltersType } from '../../services/activityService';
import ActivityCard from './ActivityCard';
import { useAuth } from '../../contexts/AuthContext';

const FeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent;
`;

const FeedContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ActivitiesList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LoadMoreButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin: 16px;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px;
  margin: 16px;
  border-radius: 8px;
  border: 1px solid #fcc;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #999;
`;

interface SimpleActivityFeedProps {
  className?: string;
  filters?: ActivityFiltersType;
  compact?: boolean;
}

const SimpleActivityFeedComponent: React.FC<SimpleActivityFeedProps> = ({ 
  className, 
  filters = {},
  compact = false,
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadActivities = useCallback(async (reset = false) => {
    // Убираем проверку user - гости тоже могут видеть активность
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const offset = reset ? 0 : activities.length;
      const limit = filters.limit ?? 20;
      const currentFilters = { ...filters, offset, limit };

      const response = await activityService.getActivityFeed(currentFilters);
      
      if (reset) {
        setActivities(response.data);
      } else {
        setActivities(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.data.length === currentFilters.limit);
    } catch (err) {
      console.error('Ошибка загрузки активности:', err);
      setError('Не удалось загрузить активность');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, activities.length]);

  const markAsRead = useCallback(async (activityId: string) => {
    try {
      await activityService.markAsRead(activityId);
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId
            ? { ...activity, is_read: true, read_at: new Date().toISOString() }
            : activity
        )
      );
    } catch (err) {
      console.error('Ошибка отметки активности как прочитанной:', err);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadActivities(false);
    }
  }, [loadingMore, hasMore, loadActivities]);

  useEffect(() => {
    // Гости тоже могут видеть активность
    loadActivities(true);
  }, [loadActivities]);

  useEffect(() => {
    // Автообновление только для авторизованных пользователей
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        const newFilters = { ...filters, offset: 0, limit: 5 };
        const response = await activityService.getActivityFeed(newFilters);
        if (response.data.length > 0) {
          setActivities(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            const newActivities = response.data.filter(a => !existingIds.has(a.id));
            return [...newActivities, ...prev];
          });
        }
      } catch {
        // silently ignore periodic refresh errors
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, filters]);

  return (
    <FeedContainer className={className}>
      <FeedContent>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {loading ? (
          <LoadingSpinner>Загрузка активности...</LoadingSpinner>
        ) : activities.length === 0 ? (
          <EmptyState>
            <EmptyIcon>{'📭'}</EmptyIcon>
            <EmptyTitle>Нет активности</EmptyTitle>
            <EmptyText>Пока нет новых событий в сообществе</EmptyText>
          </EmptyState>
        ) : (
          <>
            <ActivitiesList style={{ padding: compact ? 8 : 16 }}>
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onMarkAsRead={user ? markAsRead : undefined}
                />
              ))}
            </ActivitiesList>
            
            {hasMore && (
              <LoadMoreButton 
                onClick={loadMore} 
                disabled={loadingMore}
              >
                {loadingMore ? 'Загрузка...' : 'Загрузить еще'}
              </LoadMoreButton>
            )}
          </>
        )}
      </FeedContent>
    </FeedContainer>
  );
};

export default SimpleActivityFeedComponent;
