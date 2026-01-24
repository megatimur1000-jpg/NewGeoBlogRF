import React from 'react';
import { sanitizeHtml, escapeHtml, isDangerousContent } from '../utils/security';

interface SafeContentProps {
  content: string;
  allowHtml?: boolean;
  maxLength?: number;
  className?: string;
}

const SafeContent: React.FC<SafeContentProps> = ({
  content,
  allowHtml = false,
  maxLength = 1000,
  className = ''
}) => {
  // Проверяем на опасный контент
  if (isDangerousContent(content)) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>
        ⚠️ Контент заблокирован из соображений безопасности
      </div>
    );
  }

  // Ограничиваем длину
  const truncatedContent = content.length > maxLength 
    ? content.substring(0, maxLength) + '...'
    : content;

  if (allowHtml) {
    // Безопасно санитизируем HTML
    const sanitizedHtml = sanitizeHtml(truncatedContent);
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  // Экранируем HTML символы
  const escapedContent = escapeHtml(truncatedContent);
  return (
    <div className={className}>
      {escapedContent}
    </div>
  );
};

export default SafeContent;
