import React, { useState } from 'react';

interface Section {
  title: string;
  children: React.ReactNode;
}

interface AccordionGroupProps {
  sections: Section[];
}

const AccordionGroup: React.FC<AccordionGroupProps> = ({ sections }) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const handleAccordionClick = (key: string) => {
    setOpenAccordion(prev => prev === key ? null : key);
  };

  return (
    <div>
      {sections.map(section => (
        <div className="accordion-section" key={section.title}>
          <div
            onClick={() => handleAccordionClick(section.title)}
            style={{
              cursor: 'pointer',
              fontWeight: 'bold',
              padding: '8px 0',
              userSelect: 'none'
            }}
            className="accordion-title"
          >
            {section.title}
          </div>
          {openAccordion === section.title && (
            <div>
              {section.children}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AccordionGroup;
