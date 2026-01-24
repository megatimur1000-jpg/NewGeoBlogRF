import React from 'react';
import { useLayoutState } from '../contexts/LayoutContext';

const ChatWindows: React.FC = () => {
  const layoutContext = useLayoutState();

  // Проверяем, что контекст загружен
  if (!layoutContext) {
    return null;
  }

  const { chatWindows, removeChatWindow } = layoutContext;

  if (chatWindows.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 flex items-end space-x-2 p-4 z-50">
      {chatWindows.map((chat: any) => (
        <div
          key={chat.id}
          className="w-80 bg-white rounded-t-lg shadow-lg flex flex-col"
          style={{ height: '400px' }}
        >
          {/* Заголовок чата */}
          <div className="flex items-center justify-between px-4 py-2 bg-primary text-white rounded-t-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
                <i className="fas fa-user text-sm"></i>
              </div>
              <span className="font-medium">{chat.username}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-white/80 hover:text-white transition-colors">
                <i className="fas fa-minus text-xs"></i>
              </button>
              <button 
                onClick={() => removeChatWindow(chat.id)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
          </div>

          {/* Область сообщений */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Здесь будут сообщения */}
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
                  <p className="text-sm">Привет! Как дела?</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary/10 rounded-lg p-2 max-w-[80%]">
                  <p className="text-sm">Привет! Всё отлично, спасибо!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Поле ввода */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Написать сообщение..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button className="text-primary hover:text-primary/80 transition-colors">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatWindows; 