import { useState, useEffect, useCallback } from 'react';

// Типы для API ответов
interface CompletnessSuggestion {
  field: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  weight: number;
}

interface CompletenessData {
  score: number;
  status: string;
  statusInfo: {
    text: string;
    color: string;
    icon: string;
  };
  filledFields: number;
  totalFields: number;
  needsCompletion: boolean;
}

interface MarkerCompletenessResponse {
  markerId: string;
  completeness: CompletenessData;
  suggestions: CompletnessSuggestion[];
  priorityImprovements: Array<CompletnessSuggestion & {
    potentialScoreIncrease: number;
    estimatedNewScore: number;
  }>;
  analysis: {
    currentScore: number;
    maxPossibleScore: number;
    completionPercentage: number;
  };
}

interface UpdateCompletenessResponse {
  markerId: string;
  oldScore: number;
  newScore: number;
  levelChange: {
    changed: boolean;
    oldStatus: string;
    newStatus: string;
    improved: boolean;
    scoreIncrease: number;
  };
  completeness: CompletenessData;
  message: string;
}

interface IncompleteMarkersFilters {
  limit?: number;
  offset?: number;
  minScore?: number;
  maxScore?: number;
  category?: string;
  region?: string;
}

interface IncompleteMarker {
  id: string;
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  completeness_score: number;
  needs_completion: boolean;
  suggestions: CompletnessSuggestion[];
  canContribute: boolean;
  estimatedImpact: number;
}

/**
 * Хук для работы с системой полноты меток
 */
export const useMarkerCompleteness = (markerId?: string) => {
  const [data, setData] = useState<MarkerCompletenessResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получение данных о полноте конкретной метки
  const fetchCompleteness = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/markers/${id}/completeness`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Ошибка при получении данных о полноте метки');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('Ошибка при загрузке данных о полноте метки:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление расчета полноты метки
  const updateCompleteness = useCallback(async (id: string, token: string) => {
    try {
      const response = await fetch(`/api/markers/${id}/update-completeness`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Обновляем локальные данные, если это та же метка
        if (markerId === id) {
          setData(prev => prev ? {
            ...prev,
            completeness: result.data.completeness
          } : null);
        }
        return result.data as UpdateCompletenessResponse;
      } else {
        throw new Error(result.message || 'Ошибка при обновлении полноты метки');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Ошибка при обновлении полноты метки:', err);
      throw new Error(errorMessage);
    }
  }, [markerId]);

  // Автоматическая загрузка при смене markerId
  useEffect(() => {
    if (markerId) {
      fetchCompleteness(markerId);
    }
  }, [markerId, fetchCompleteness]);

  return {
    data,
    loading,
    error,
    fetchCompleteness,
    updateCompleteness,
    refetch: markerId ? () => fetchCompleteness(markerId) : undefined
  };
};

/**
 * Хук для работы со списком неполных меток
 */
export const useIncompleteMarkers = () => {
  const [markers, setMarkers] = useState<IncompleteMarker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0
  });

  const fetchIncompleteMarkers = useCallback(async (
    filters: IncompleteMarkersFilters = {},
    token: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/markers/incomplete?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setMarkers(result.data.markers);
        setPagination(result.data.pagination);
        return result.data;
      } else {
        throw new Error(result.message || 'Ошибка при получении неполных меток');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('Ошибка при загрузке неполных меток:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    markers,
    loading,
    error,
    pagination,
    fetchIncompleteMarkers
  };
};

/**
 * Утилитарные функции для работы с полнотой меток
 */
export const markerCompletenessUtils = {
  /**
   * Получить цвет статуса полноты
   */
  getStatusColor: (status: string): string => {
    switch (status) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'acceptable': return '#f59e0b';
      case 'poor': return '#f97316';
      default: return '#ef4444';
    }
  },

  /**
   * Получить иконку статуса полноты
   */
  getStatusIcon: (status: string): string => {
    switch (status) {
      case 'excellent': return '🌟';
      case 'good': return '✅';
      case 'acceptable': return '⚠️';
      case 'poor': return '📝';
      default: return '❗';
    }
  },

  /**
   * Проверить, нужно ли показывать виджет полноты
   */
  shouldShowWidget: (score: number): boolean => {
    return score < 80;
  },

  /**
   * Получить мотивационное сообщение на основе статуса
   */
  getMotivationalMessage: (status: string, score: number): string => {
    switch (status) {
      case 'excellent':
        return 'Отличная работа! Ваша метка полностью заполнена.';
      case 'good':
        return 'Хорошо! Осталось совсем немного до идеала.';
      case 'acceptable':
        return 'Неплохо! Добавьте еще немного деталей.';
      case 'poor':
        return 'Есть куда стремиться! Дополните основную информацию.';
      default:
        return 'Метка требует серьезного дополнения. Помогите сообществу!';
    }
  },

  /**
   * Рассчитать потенциальное улучшение рейтинга
   */
  calculatePotentialImprovement: (suggestions: CompletnessSuggestion[]): number => {
    return suggestions.reduce((sum, suggestion) => sum + suggestion.weight, 0);
  }
};
