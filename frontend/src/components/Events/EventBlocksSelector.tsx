import React from 'react';

interface EventBlocksSelectorProps {
  selectedBlocks: string[];
  onToggleBlock: (block: string) => void;
}

export const EventBlocksSelector: React.FC<EventBlocksSelectorProps> = ({ 
  selectedBlocks, 
  onToggleBlock 
}) => {
  const blocks = [
    { id: 'howToGet', name: 'Как добраться' },
    { id: 'whereToStay', name: 'Где остановиться' },
    { id: 'whereToEat', name: 'Где поесть' },
    { id: 'whatToSee', name: 'Что посмотреть' }
  ];

  return (
    <div className="event-blocks-selector">
      <h3>Дополнительные блоки</h3>
      <div className="blocks-grid">
        {blocks.map(block => (
          <button
            key={block.id}
            onClick={() => onToggleBlock(block.id)}
            className={`block-button ${selectedBlocks.includes(block.id) ? 'selected' : ''}`}
          >
            {block.name}
          </button>
        ))}
      </div>
    </div>
  );
};