import React, { useState } from 'react';

export type FilterLogic = 'OR' | 'AND';

interface HashtagFilterProps {
  hashtags: string[];
  selectedHashtags: string[];
  onFilterChange: (selected: string[], logic: FilterLogic) => void;
  initialLogic?: FilterLogic;
}

const HashtagFilter: React.FC<HashtagFilterProps> = ({
  hashtags,
  selectedHashtags,
  onFilterChange,
  initialLogic = 'OR',
}) => {
  const [logic, setLogic] = useState<FilterLogic>(initialLogic);

  const toggleHashtag = (hashtag: string) => {
    const newSelected = selectedHashtags.includes(hashtag)
      ? selectedHashtags.filter(tag => tag !== hashtag)
      : [...selectedHashtags, hashtag];
    onFilterChange(newSelected, logic);
  };

  const toggleLogic = () => {
    const newLogic = logic === 'OR' ? 'AND' : 'OR';
    setLogic(newLogic);
    onFilterChange(selectedHashtags, newLogic);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">Логика фильтра:</span>
        <button
          onClick={toggleLogic}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {logic === 'OR' ? 'ИЛИ (Любой из тегов)' : 'И (Все теги)'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {hashtags.map(hashtag => (
          <button
            key={hashtag}
            onClick={() => toggleHashtag(hashtag)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${
                selectedHashtags.includes(hashtag)
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            #{hashtag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HashtagFilter; 