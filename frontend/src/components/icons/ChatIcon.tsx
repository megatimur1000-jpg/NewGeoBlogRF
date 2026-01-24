import React from 'react';
import { FaComments } from 'react-icons/fa';

interface ChatIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const ChatIcon: React.FC<ChatIconProps> = ({ 
  size = 16, 
  color = 'currentColor', 
  className = '' 
}) => {
  return (
    <FaComments 
      size={size} 
      color={color} 
      className={className}
    />
  );
};
