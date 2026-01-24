import React from 'react';

interface ModerationWrapperProps {
  children: React.ReactNode;
  content: string;
  onModerate?: (isApproved: boolean) => void;
}

const ModerationWrapper: React.FC<ModerationWrapperProps> = ({ 
  children, 
  content
}) => {
  // Simple content moderation check
  const isContentAppropriate = (text: string): boolean => {
    const spamWords = ['реклама', 'купить', 'скидка', 'акция'];
    const inappropriateWords = ['плохо', 'ужасно', 'ненавижу'];
    
    const lowerText = text.toLowerCase();
    
    // Check for spam
    const hasSpam = spamWords.some(word => lowerText.includes(word));
    if (hasSpam) return false;
    
    // Check for inappropriate content
    const hasInappropriate = inappropriateWords.some(word => lowerText.includes(word));
    if (hasInappropriate) return false;
    
    return true;
  };

  const isApproved = isContentAppropriate(content);

  return (
    <div className={`moderation-wrapper ${isApproved ? 'approved' : 'needs-review'}`}>
      {children}
      {!isApproved && (
        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
          ⚠️ Контент требует проверки модератора
        </div>
      )}
    </div>
  );
};

export default ModerationWrapper;
