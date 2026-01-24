import React, { useState } from 'react';
import { Settings, Archive, Trash2, Crown, Shield, UserX } from 'lucide-react';
import { Room, User } from '../../types/chat';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface AdminPanelProps {
  rooms: Room[];
  allUsers: User[];
  currentUser: User;
  onArchiveRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onPromoteUser: (userId: string, role: 'moderator' | 'admin') => void;
  onBanUser: (userId: string) => void;
  onClose: () => void;
}


export const AdminPanel: React.FC<AdminPanelProps> = ({
  rooms,
  allUsers,
  currentUser,
  onArchiveRoom,
  onDeleteRoom,
  onPromoteUser,
  onBanUser,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'users'>('rooms');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    user.id !== currentUser.id
  );

  const canPromoteToAdmin = currentUser.role === 'admin';
  const canPromoteToModerator = currentUser.role === 'admin';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-slate-600" />
              <h2 className="text-xl font-semibold text-slate-800">Панель администратора</h2>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'rooms'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Комнаты
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Пользователи
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-200">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Поиск по ${activeTab === 'rooms' ? 'комнатам' : 'пользователям'}...`}
            className="max-w-md"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'rooms' ? (
            <div className="space-y-4">
              {filteredRooms.map(room => (
                <div key={room.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-800 flex items-center space-x-2">
                        <span>{room.name}</span>
                        {room.isArchived && <Archive className="w-4 h-4 text-amber-500" />}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {room.description || 'Нет описания'}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Участников: {room.participants.length} • 
                        Создана: {room.createdAt.toLocaleDateString()} • 
                        Тип: {room.type === 'private' ? 'Приватная' : 'Публичная'}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!room.isArchived ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onArchiveRoom(room.id)}
                          className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        >
                          <Archive className="w-4 h-4 mr-1" />
                          Архивировать
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onArchiveRoom(room.id)}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          Восстановить
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteRoom(room.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map(user => (
                <div key={user.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          user.status === 'online' ? 'bg-green-500' :
                          user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-slate-800">{user.name}</h3>
                          {user.role === 'admin' && <Crown className="w-4 h-4 text-yellow-500" />}
                          {user.role === 'moderator' && <Shield className="w-4 h-4 text-blue-500" />}
                        </div>
                        <p className="text-sm text-slate-600 capitalize">
                          {user.role} • {user.status}
                        </p>
                        <p className="text-xs text-slate-400">
                          Присоединился: {user.joinedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {user.role === 'member' && canPromoteToModerator && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onPromoteUser(user.id, 'moderator')}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Модератор
                        </Button>
                      )}
                      
                      {user.role !== 'admin' && canPromoteToAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onPromoteUser(user.id, 'admin')}
                          className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                        >
                          <Crown className="w-4 h-4 mr-1" />
                          Админ
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onBanUser(user.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Заблокировать
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};