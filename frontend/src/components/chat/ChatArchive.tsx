import React, { useState } from 'react';
import { Search, MessageSquare, Archive } from 'lucide-react';
import { Message, Room } from '../../types/chat';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { MessageItem } from "./MessageItem";

interface ChatArchiveProps {
  rooms: Room[];
  allMessages: { [roomId: string]: Message[] };
  currentUser: any;
  onClose: () => void;
}

export const ChatArchive: React.FC<ChatArchiveProps> = ({
  rooms,
  allMessages,
  currentUser,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Получаем все сообщения
  const getAllMessages = () => {
    let messages: Message[] = [];
    Object.values(allMessages).forEach(roomMessages => {
      messages = [...messages, ...roomMessages];
    });
    return messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  // Фильтруем сообщения
  const filteredMessages = getAllMessages().filter(message => {
    const matchesSearch = searchQuery === '' || 
      message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRoom = selectedRoom === 'all' || message.roomId === selectedRoom;
    
    const matchesDate = (() => {
      if (dateFilter === 'all') return true;
      
      const now = new Date();
      const messageDate = message.timestamp;
      
      switch (dateFilter) {
        case 'today':
          return messageDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return messageDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return messageDate >= monthAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesRoom && matchesDate;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Archive className="w-6 h-6 text-slate-600" />
              <h2 className="text-xl font-semibold text-slate-800">Архив сообщений</h2>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по сообщениям и авторам..."
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="all">Все комнаты</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="all">Все время</option>
              <option value="today">Сегодня</option>
              <option value="week">Неделя</option>
              <option value="month">Месяц</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Сообщения не найдены</p>
              <p className="text-slate-400 text-sm">Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-sm text-slate-500 mb-4">
                Найдено сообщений: {filteredMessages.length}
              </div>
              {filteredMessages.map((message) => {
                const room = rooms.find(r => r.id === message.roomId);
                return (
                  <div key={message.id} className="border-l-2 border-slate-200 pl-4">
                    <div className="text-xs text-slate-400 mb-2">
                      в #{room?.name} • {message.timestamp.toLocaleString()}
                    </div>
                    <MessageItem
                      message={message}
                      isOwn={message.author.id === currentUser.id}
                      onReply={() => {}}
                      onReact={() => {}}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};