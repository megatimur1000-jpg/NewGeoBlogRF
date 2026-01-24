import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700'
  };

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    stable: '→'
  };

  return (
    <div className={`bg-white rounded-lg border-2 ${colorClasses[color]} p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        {icon && <div className="text-xl">{icon}</div>}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mb-2">{subtitle}</div>
      )}
      {trend && (
        <div className={`text-xs flex items-center ${
          trend.direction === 'up' ? 'text-green-600' :
          trend.direction === 'down' ? 'text-red-600' :
          'text-gray-600'
        }`}>
          <span className="mr-1">{trendIcons[trend.direction]}</span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;

