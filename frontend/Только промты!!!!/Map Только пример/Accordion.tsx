import React, { useState, ReactNode } from 'react';

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      <button
        className="w-full flex justify-between items-center px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <span>{title}</span>
        <span className={`transform transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
      </button>
      {open && (
        <div className="mt-2 px-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
