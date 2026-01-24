/**
 * Компонент для отображения бейджа "На модерации"
 */

import React from 'react';

interface ModerationBadgeProps {
  status?: 'pending' | 'active' | 'rejected' | 'revision';
  className?: string;
}

const ModerationBadge: React.FC<ModerationBadgeProps> = ({ status = 'pending', className = '' }) => {
  if (status === 'active') {
    return null; // Не показываем бейдж для активного контента
  }

  const getBadgeConfig = () => {
    switch (status) {
      case 'pending':
        return {
          text: '⏳ На модерации',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-300',
        };
      case 'revision':
        return {
          text: '📝 На доработке',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300',
        };
      case 'rejected':
        return {
          text: '❌ Отклонено',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300',
        };
      default:
        return {
          text: '⏳ На модерации',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-300',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <div
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} border ${className}`}
    >
      {config.text}
    </div>
  );
};

export default ModerationBadge;

