import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Hash, Lock, Archive, Users, X } from 'lucide-react';
import { Room, Message, User } from '../../types/chat';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MessageItem } from './MessageItem';

interface ChatMainProps {
  room: Room | null;
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string, roomId: string, replyTo?: Message) => void;
  onToggleParticipants: () => void;
  showParticipants: boolean;
  onReact: (messageId: string, emoji: string) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
}

export const ChatMain: React.FC<ChatMainProps> = ({
  room,
  messages,
  currentUser,
  onSendMessage,
  onToggleParticipants,
  showParticipants,
  onReact,
  onEdit,
  onDelete,
}) => {
  const [messageText, setMessageText] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) {
      return;
    }
    
    if (!room) {
      return;
    }

    onSendMessage(messageText.trim(), room.id, replyTo || undefined);
    setMessageText('');
    setReplyTo(null);
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };



  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hash className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Добро пожаловать в чат!</h2>
          <p className="text-slate-600">Выберите комнату или создайте новую для начала общения</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {room.type === 'private' ? (
                <Lock className="w-5 h-5 text-slate-400" />
              ) : (
                <Hash className="w-5 h-5 text-slate-400" />
              )}
              <h1 className="text-xl font-semibold text-slate-800">{room.name}</h1>
              {room.isArchived && (
                <Archive className="w-4 h-4 text-amber-500" />
              )}
            </div>
            {room.description && (
              <span className="text-slate-500 text-sm">• {room.description}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleParticipants}
              className={`${showParticipants ? 'bg-slate-100' : ''}`}
            >
              <Users className="w-4 h-4 mr-2" />
              {room.participants.length}
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Hash className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-500">Нет сообщений в этой комнате</p>
            <p className="text-slate-400 text-sm">Будьте первым, кто напишет!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onReply={handleReply}
              onReact={onReact}
              onEdit={onEdit}
              onDelete={onDelete}
              isOwn={message.author.id === currentUser.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="bg-blue-50 border-t border-blue-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-600 font-medium">Ответ на:</span>
              <span className="text-sm text-blue-800 truncate max-w-xs">
                {replyTo.author.name}: {replyTo.content}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={cancelReply}
              className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
            >
              <X size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-slate-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={replyTo ? `Ответить ${replyTo.author.name}...` : "Введите сообщение..."}
              className="min-h-[44px] resize-none border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              title="Прикрепить файл"
            >
              <Paperclip size={18} />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 hover:bg-yellow-50 hover:text-yellow-600 transition-colors duration-200"
              title="Добавить реакцию"
            >
              <Smile size={18} />
            </Button>
            
            <Button
              type="submit"
              disabled={!messageText.trim()}
              className={`h-10 px-4 transition-all duration-200 ${
                messageText.trim()
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-sm'
              }`}
            >
              <Send size={18} className="mr-2" />
              Отправить
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
