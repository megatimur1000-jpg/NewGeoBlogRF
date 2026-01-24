import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  FaComments, FaUserPlus, FaUsers, FaCrown, FaCog, FaBell
} from 'react-icons/fa';
import { Activity } from '../../types/activity';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface ActivityItemProps {
  activity: Activity;
  onClick?: () => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onClick }) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'message':
        return <FaComments className="w-5 h-5 text-blue-500" />;
      case 'join':
        return <FaUserPlus className="w-5 h-5 text-green-500" />;
      case 'room_created':
        return <FaUsers className="w-5 h-5 text-purple-500" />;
      case 'user_promoted':
        return <FaCrown className="w-5 h-5 text-yellow-500" />;
      case 'system':
        return activity.category === 'announcement'
          ? <FaBell className="w-5 h-5 text-orange-500" />
          : <FaCog className="w-5 h-5 text-gray-500" />;
      default:
        return <FaComments className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityContent = () => {
    switch (activity.type) {
      case 'message':
        return (
          <div>
            <span className="font-medium text-slate-800">{activity.user.name}</span>
            <span className="text-slate-600 ml-1">отправил сообщение в</span>
            <Badge
              variant="outline"
              className="ml-1 px-2 py-1 rounded-lg border-blue-300 bg-blue-50 text-blue-700 font-medium"
            >
              {activity.roomName}
            </Badge>
            <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded italic">
              "{activity.content}"
            </p>
          </div>
        );
      case 'join':
        return (
          <div>
            <span className="font-medium text-slate-800">{activity.user.name}</span>
            <span className="text-slate-600 ml-1">присоединился к комнате</span>
            <Badge
              variant="outline"
              className="ml-1 px-2 py-1 rounded-lg border-green-300 bg-green-50 text-green-700 font-medium"
            >
              {activity.roomName}
            </Badge>
          </div>
        );
      case 'room_created':
        return (
          <div>
            <span className="font-medium text-slate-800">{activity.user.name}</span>
            <span className="text-slate-600 ml-1">создал</span>
            <Badge
              variant="outline"
              className={
                activity.roomType === 'private'
                  ? "ml-1 px-2 py-1 rounded-lg border-pink-300 bg-pink-50 text-pink-700 font-medium"
                  : "ml-1 px-2 py-1 rounded-lg border-purple-300 bg-purple-50 text-purple-700 font-medium"
              }
            >
              {activity.roomType === 'private' ? 'приватную' : 'публичную'}
            </Badge>
            <span className="text-slate-600 ml-1">комнату</span>
            <Badge
              variant="outline"
              className="ml-1 px-2 py-1 rounded-lg border-blue-300 bg-blue-50 text-blue-700 font-medium"
            >
              {activity.roomName}
            </Badge>
          </div>
        );
      case 'user_promoted':
        return (
          <div>
            <span className="font-medium text-slate-800">{activity.user.name}</span>
            <span className="text-slate-600 ml-1">назначил</span>
            <span className="font-medium text-slate-800 ml-1">{activity.targetUser?.name}</span>
            <Badge
              variant="outline"
              className="ml-1 px-2 py-1 rounded-lg border-yellow-300 bg-yellow-50 text-yellow-700 font-medium"
            >
              {activity.newRole === 'admin' ? 'администратором' : 'модератором'}
            </Badge>
            <span className="text-slate-600 ml-1">в комнате</span>
            <Badge
              variant="outline"
              className="ml-1 px-2 py-1 rounded-lg border-blue-300 bg-blue-50 text-blue-700 font-medium"
            >
              {activity.roomName}
            </Badge>
          </div>
        );
      case 'system':
        return (
          <div>
            <Badge
              variant={activity.category === 'announcement' ? 'default' : 'secondary'}
              className={
                activity.category === 'announcement'
                  ? "mr-2 px-2 py-1 rounded-lg border-orange-300 bg-orange-50 text-orange-700 font-medium"
                  : "mr-2 px-2 py-1 rounded-lg border-gray-300 bg-gray-50 text-gray-700 font-medium"
              }
            >
              {activity.category === 'announcement'
                ? 'Объявление'
                : activity.category === 'maintenance'
                ? 'Техработы'
                : 'Обновление'}
            </Badge>
            <span className="text-slate-700">{activity.content}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const timeAgo = formatDistanceToNow(activity.timestamp, {
    addSuffix: true,
    locale: ru
  });

  return (
    <Card
      className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in`}
      style={{
        borderRadius: 18,
        boxShadow: activity.isRead
          ? '0 2px 8px rgba(0,0,0,0.04)'
          : '0 4px 16px rgba(59,130,246,0.10)',
        marginBottom: 8,
        background: '#fff',
      }}
    >
      <div className="flex items-start space-x-3" onClick={onClick}>
        <div className="flex-shrink-0 p-2 rounded-full bg-white shadow-sm">
          {getActivityIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <div
              className="activity-item-card"
              style={{
                maxHeight: 140,
                overflow: 'auto',
                borderRadius: 16,
                background: '#f9f9fb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: 16,
                marginBottom: 8,
              }}
            >
              {getActivityContent()}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{timeAgo}</span>
            {!activity.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};