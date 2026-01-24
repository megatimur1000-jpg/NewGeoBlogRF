import React from 'react';
import { X } from 'lucide-react';
import './GlassHeader.css';

export interface GlassHeaderProps {
  title: string;
  onClose?: () => void;
  count?: number;
  showCloseButton?: boolean;
  className?: string;
}

const GlassHeader: React.FC<GlassHeaderProps> = ({
  title,
  onClose,
  count,
  showCloseButton = true,
  className = '',
}) => {
  return (
    <div className={`glass-header ${className}`}>
      <div className="glass-header-content">
        <h2 className="glass-header-title">
          {title}
          {count !== undefined && count > 0 && (
            <span className="glass-header-count"> ({count})</span>
          )}
        </h2>
        {showCloseButton && onClose && (
          <button
            className="glass-header-close"
            onClick={onClose}
            aria-label="Закрыть"
            type="button"
          >
            <X size={20} />
          </button>
        )}
      </div>
      <div className="glass-header-divider" />
    </div>
  );
};

export default GlassHeader;

