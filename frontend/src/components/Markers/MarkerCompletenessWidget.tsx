import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Edit, Star, TrendingUp } from 'lucide-react';
import styled from 'styled-components';

// Типы для данных о полноте метки
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

interface MarkerCompletenessData {
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

interface MarkerCompletenessWidgetProps {
  markerId: string;
  onContribute?: (field: string) => void;
  onEdit?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

// Стилизованные компоненты
const CompletenessContainer = styled.div<{ compact?: boolean }>`
  background: white;
  border-radius: 12px;
  padding: ${props => props.compact ? '16px' : '20px'};
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
`;

const ScoreHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ScoreIcon = styled.div<{ status: string }>`
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'acceptable': return '#f59e0b';
      case 'poor': return '#f97316';
      default: return '#ef4444';
    }
  }};
  color: white;
`;

const ScoreText = styled.div`
  display: flex;
  flex-direction: column;
`;

const ScoreValue = styled.div<{ status: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => {
    switch (props.status) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6'; 
      case 'acceptable': return '#f59e0b';
      case 'poor': return '#f97316';
      default: return '#ef4444';
    }
  }};
`;

const StatusText = styled.div<{ status: string }>`
  font-size: 14px;
  color: ${props => {
    switch (props.status) {
      case 'excellent': return '#065f46';
      case 'good': return '#1e40af';
      case 'acceptable': return '#92400e';
      case 'poor': return '#c2410c';
      default: return '#b91c1c';
    }
  }};
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 12px 0;
`;

const ProgressFill = styled.div<{ percentage: number; status: string }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: ${props => {
    switch (props.status) {
      case 'excellent': return 'linear-gradient(90deg, #10b981, #34d399)';
      case 'good': return 'linear-gradient(90deg, #3b82f6, #60a5fa)';
      case 'acceptable': return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
      case 'poor': return 'linear-gradient(90deg, #f97316, #fb923c)';
      default: return 'linear-gradient(90deg, #ef4444, #f87171)';
    }
  }};
  transition: width 0.3s ease;
`;

const SuggestionsSection = styled.div`
  margin-top: 16px;
`;

const SuggestionsTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SuggestionCard = styled.div<{ priority: string }>`
  background: ${props => {
    switch (props.priority) {
      case 'high': return '#fef2f2';
      case 'medium': return '#fefbf2';
      default: return '#f8fafc';
    }
  }};
  border: 1px solid ${props => {
    switch (props.priority) {
      case 'high': return '#fecaca';
      case 'medium': return '#fed7aa';
      default: return '#e2e8f0';
    }
  }};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SuggestionContent = styled.div`
  flex: 1;
`;

const SuggestionMessage = styled.div`
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
`;

const SuggestionMeta = styled.div`
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PriorityBadge = styled.span<{ priority: string }>`
  background: ${props => {
    switch (props.priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#d97706';
      default: return '#6b7280';
    }
  }};
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
`;

const ActionButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const CollaborationNote = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  font-size: 13px;
  color: #0c4a6e;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MarkerCompletenessWidget: React.FC<MarkerCompletenessWidgetProps> = ({
  markerId,
  onContribute,
  onEdit,
  showActions = true,
  compact = false
}) => {
  const [data, setData] = useState<MarkerCompletenessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompletenessData();
  }, [markerId]);

  const fetchCompletenessData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/markers/${markerId}/completeness`);
      
      if (!response.ok) {
        // Тихое поведение для 404 — метка могла не существовать/быть скрыта
        if (response.status === 404) {
          setData(null);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Ошибка при получении данных о полноте метки');
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных о полноте метки:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleContributeClick = (field: string) => {
    if (onContribute) {
      onContribute(field);
    } else if (onEdit) {
      onEdit();
    }
  };

  if (loading) {
    return (
      <CompletenessContainer compact={compact}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          Анализ полноты метки...
        </div>
      </CompletenessContainer>
    );
  }

  if (error) {
    return (
      <CompletenessContainer compact={compact}>
        <div style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      </CompletenessContainer>
    );
  }

  if (!data || data.completeness.score >= 80) {
    return null; // Не показываем виджет для полных меток
  }

  const { completeness, suggestions, priorityImprovements } = data;

  return (
    <CompletenessContainer compact={compact}>
      <ScoreHeader>
        <ScoreDisplay>
          <ScoreIcon status={completeness.status}>
            {completeness.statusInfo.icon}
          </ScoreIcon>
          <ScoreText>
            <ScoreValue status={completeness.status}>
              {completeness.score}%
            </ScoreValue>
            <StatusText status={completeness.status}>
              {completeness.statusInfo.text}
            </StatusText>
          </ScoreText>
        </ScoreDisplay>
        
        {showActions && onEdit && (
          <ActionButton onClick={onEdit}>
            <Edit size={14} />
            Редактировать
          </ActionButton>
        )}
      </ScoreHeader>

      <ProgressBar>
        <ProgressFill 
          percentage={completeness.score} 
          status={completeness.status}
        />
      </ProgressBar>

      <div style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
        Заполнено {completeness.filledFields} из {completeness.totalFields} обязательных полей
      </div>

      {!compact && suggestions.length > 0 && (
        <SuggestionsSection>
          <SuggestionsTitle>
            <TrendingUp size={16} />
            Улучшите метку
          </SuggestionsTitle>
          
          {priorityImprovements.slice(0, 3).map((suggestion, index) => (
            <SuggestionCard key={index} priority={suggestion.priority}>
              <SuggestionContent>
                <SuggestionMessage>
                  {suggestion.message}
                </SuggestionMessage>
                <SuggestionMeta>
                  <PriorityBadge priority={suggestion.priority}>
                    {suggestion.priority}
                  </PriorityBadge>
                  <span>+{suggestion.potentialScoreIncrease}% к рейтингу</span>
                  <Star size={12} style={{ color: '#f59e0b' }} />
                  <span>→ {suggestion.estimatedNewScore}%</span>
                </SuggestionMeta>
              </SuggestionContent>
              
              {showActions && (
                <ActionButton onClick={() => handleContributeClick(suggestion.field)}>
                  <Edit size={12} />
                  Дополнить
                </ActionButton>
              )}
            </SuggestionCard>
          ))}
        </SuggestionsSection>
      )}

      {showActions && onContribute && (
        <CollaborationNote>
          <Check size={16} style={{ color: '#0ea5e9' }} />
          <div>
            <strong>💡 Помогите сообществу!</strong> Ваш вклад будет учтен в рейтинге метки после модерации.
            Получите очки опыта за улучшение контента.
          </div>
        </CollaborationNote>
      )}
    </CompletenessContainer>
  );
};

export default MarkerCompletenessWidget;
