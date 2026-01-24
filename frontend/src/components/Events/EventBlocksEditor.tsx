import React from 'react';

interface EventBlocksEditorProps {
  blocks: any;
  onUpdateBlocks: (blocks: any) => void;
}

export const EventBlocksEditor: React.FC<EventBlocksEditorProps> = ({ 
  blocks, 
  onUpdateBlocks 
}) => {
  const updateBlock = (blockId: string, field: string, value: any) => {
    onUpdateBlocks({
      ...blocks,
      [blockId]: {
        ...blocks[blockId],
        [field]: value
      }
    });
  };

  return (
    <div className="event-blocks-editor">
      {Object.entries(blocks).map(([blockId, block]: [string, any]) => (
        <div key={blockId} className="block-editor">
          <h4>{block.name}</h4>
          <textarea
            value={block.content || ''}
            onChange={(e) => updateBlock(blockId, 'content', e.target.value)}
            placeholder={`Введите ${block.name.toLowerCase()}...`}
          />
        </div>
      ))}
    </div>
  );
};