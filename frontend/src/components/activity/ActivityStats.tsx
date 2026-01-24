import React from 'react';
import styled from 'styled-components';
import { ActivityStats as ActivityStatsType } from '../../services/activityService';
import { FaChartBar } from 'react-icons/fa';

const StatsContainer = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
`;

const StatsTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const StatCard = styled.div<{ color: string }>`
  background: ${props => props.color}15;
  border: 1px solid ${props => props.color}30;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
`;

const StatNumber = styled.div<{ color: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.color};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  font-weight: 500;
`;

const MarkAllReadButton = styled.button`
  width: 100%;
  padding: 10px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #229954;
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

interface ActivityStatsProps {
  stats: ActivityStatsType;
  onMarkAllAsRead: () => void;
}

const ActivityStats: React.FC<ActivityStatsProps> = ({ stats, onMarkAllAsRead }) => {
  const hasUnread = stats.unread_activities > 0;

  return (
    <StatsContainer>
      <StatsTitle>
        <FaChartBar /> Статистика
      </StatsTitle>
      
      <StatsGrid>
        <StatCard color="#3498db">
          <StatNumber color="#3498db">{stats.total_activities}</StatNumber>
          <StatLabel>Всего событий</StatLabel>
        </StatCard>
        
        <StatCard color="#e74c3c">
          <StatNumber color="#e74c3c">{stats.unread_activities}</StatNumber>
          <StatLabel>Непрочитанных</StatLabel>
        </StatCard>
        
        <StatCard color="#27ae60">
          <StatNumber color="#27ae60">{stats.message_activities}</StatNumber>
          <StatLabel>Сообщений</StatLabel>
        </StatCard>
        
        <StatCard color="#9b59b6">
          <StatNumber color="#9b59b6">{stats.system_activities}</StatNumber>
          <StatLabel>Системных</StatLabel>
        </StatCard>
      </StatsGrid>

      {hasUnread && (
        <MarkAllReadButton onClick={onMarkAllAsRead}>
          Отметить все как прочитанные
        </MarkAllReadButton>
      )}
    </StatsContainer>
  );
};

export default ActivityStats;
