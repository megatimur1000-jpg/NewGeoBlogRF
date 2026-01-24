import React, { useState } from 'react';
import { Crown, Shield, User, MoreVertical, UserMinus, UserPlus } from 'lucide-react';
import { Room, User as UserType } from '../../types/chat';

interface ParticipantsPanelProps {
  room: Room;
  currentUser: UserType;
  onKickUser?: (userId: string) => void;
  onPromoteUser?: (userId: string) => void;
  onInviteUser?: () => void;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  room,
  currentUser,
  onKickUser,
  onPromoteUser,
  onInviteUser,
}) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const getRoleIcon = (role: UserType['role']) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: UserType['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const canManageUser = (user: UserType) => {
    return (currentUser.role === 'admin' || 
           (currentUser.role === 'moderator' && user.role === 'member')) &&
           user.id !== currentUser.id;
  };

  const sortedParticipants = [...room.participants].sort((a, b) => {
    const roleOrder = { admin: 0, moderator: 1, member: 2 };
    const statusOrder = { online: 0, away: 1, offline: 2 };
    
    if (roleOrder[a.role] !== roleOrder[b.role]) {
      return roleOrder[a.role] - roleOrder[b.role];
    }
    
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {sortedParticipants.map((participant) => (
            <div
              key={participant.id}
              className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(participant.status)}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-800 truncate">
                      {participant.name}
                    </span>
                    {getRoleIcon(participant.role)}
                  </div>
                  <p className="text-xs text-slate-500 capitalize">{participant.status}</p>
                </div>
              </div>

              {canManageUser(participant) && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setSelectedUser(selectedUser === participant.id ? null : participant.id)}
                    className="bg-none border-none text-xs text-slate-400 hover:text-slate-600 cursor-pointer flex items-center gap-1 px-2 py-1 rounded transition-colors duration-200 hover:bg-slate-100"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>
                  
                  {selectedUser === participant.id && (
                    <div className="absolute right-2 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 min-w-48">
                      {participant.role === 'member' && currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            onPromoteUser?.(participant.id);
                            setSelectedUser(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition-colors"
                        >
                          <Shield className="w-3 h-3" />
                          <span>Сделать модератором</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onKickUser?.(participant.id);
                          setSelectedUser(null);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                      >
                        <UserMinus className="w-3 h-3" />
                        <span>Исключить</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Пустое состояние */}
        {sortedParticipants.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">Участники не найдены</p>
          </div>
        )}
      </div>
      
      {/* Footer с кнопкой приглашения */}
      {(currentUser.role === 'admin' || currentUser.role === 'moderator') && (
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onInviteUser}
            className="w-full bg-none border border-slate-300 text-xs text-slate-600 hover:text-slate-800 hover:border-slate-400 px-3 py-2 rounded transition-all duration-200 hover:bg-slate-100"
          >
            <UserPlus className="w-3 h-3 mr-2 inline" />
            Пригласить участника
          </button>
        </div>
      )}
    </div>
  );
};