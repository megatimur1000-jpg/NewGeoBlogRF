import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './GlassAccordion.css';

export interface GlassAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  className?: string;
}

const GlassAccordion: React.FC<GlassAccordionProps> = ({
  title,
  children,
  defaultOpen = false,
  onToggle,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  return (
    <div className={`glass-accordion ${isOpen ? 'glass-accordion-open' : ''} ${className}`}>
      <button
        className="glass-accordion-header"
        onClick={handleToggle}
        aria-expanded={isOpen}
        type="button"
      >
        <span className="glass-accordion-title">{title}</span>
        <ChevronDown
          className={`glass-accordion-icon ${isOpen ? 'glass-accordion-icon-open' : ''}`}
          size={20}
        />
      </button>
      <div className={`glass-accordion-content ${isOpen ? 'glass-accordion-content-open' : ''}`}>
        <div className="glass-accordion-inner">{children}</div>
      </div>
    </div>
  );
};

export default GlassAccordion;

