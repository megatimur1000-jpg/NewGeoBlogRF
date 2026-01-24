/**
 * Компонент уведомления о получении XP
 * Всплывающее уведомление с анимацией
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Zap } from 'lucide-react';

interface XPNotificationProps {
  amount: number;
  source?: string;
  onClose?: () => void;
}

const XPNotification: React.FC<XPNotificationProps> = ({ 
  amount, 
  source,
  onClose 
}) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300); // Ждём окончания анимации
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  if (!visible) return null;
  
  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
    }`}>
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[250px] animate-slide-in">
        <div className="bg-white/20 rounded-full p-2">
          <Zap className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-lg">+{amount} XP</div>
          {source && (
            <div className="text-xs opacity-90">{source}</div>
          )}
        </div>
        <CheckCircle2 className="w-5 h-5" />
      </div>
      
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default XPNotification;


