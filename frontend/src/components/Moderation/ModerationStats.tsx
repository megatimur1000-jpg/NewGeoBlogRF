import React from 'react';

interface ModerationStatsProps {
  stats?: {
    totalModerated: number;
    spamDetected: number;
    inappropriateContent: number;
    fakeContent: number;
    pendingReview: number;
  };
  className?: string;
}

const ModerationStats: React.FC<ModerationStatsProps> = ({ stats, className = '' }) => {
  const defaultStats = {
    totalModerated: 0,
    spamDetected: 0,
    inappropriateContent: 0,
    fakeContent: 0,
    pendingReview: 0
  };

  const statsData = stats || defaultStats;
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Статистика модерации</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{statsData.totalModerated}</div>
          <div className="text-sm text-blue-800">Всего проверено</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{statsData.spamDetected}</div>
          <div className="text-sm text-red-800">Спам обнаружен</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{statsData.inappropriateContent}</div>
          <div className="text-sm text-orange-800">Неподходящий контент</div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{statsData.fakeContent}</div>
          <div className="text-sm text-yellow-800">Фейковый контент</div>
        </div>
      </div>
      
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <div className="text-lg font-semibold text-gray-700">{statsData.pendingReview}</div>
        <div className="text-sm text-gray-600">Ожидает проверки</div>
      </div>
    </div>
  );
};

export default ModerationStats;
