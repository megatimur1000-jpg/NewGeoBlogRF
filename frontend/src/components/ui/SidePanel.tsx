// SidePanel.tsx
import React, { useEffect } from 'react';
import './SidePanel.css';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const SidePanel: React.FC<SidePanelProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title 
}) => {
  // Закрытие по клавише Escape
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Закрытие по клику вне панели
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="side-panel-overlay" onClick={handleBackdropClick}>
      <div className={`side-panel open`} role="dialog" aria-modal="true" aria-label={title || 'Side panel'} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="side-panel-header">
            <h3 className="side-panel-title">{title}</h3>
            <button onClick={onClose} className="side-panel-close" aria-label="Закрыть панель">×</button>
          </div>
        )}
        <div className="side-panel-body">{children}</div>
      </div>
    </div>
  );
};

export default SidePanel;
