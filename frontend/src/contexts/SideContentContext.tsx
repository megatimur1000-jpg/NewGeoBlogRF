import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SideContentContextType {
  content: ReactNode | null;
  setContent: (content: ReactNode | null) => void;
  title: string;
  setTitle: (title: string) => void;
}

const SideContentContext = createContext<SideContentContextType | undefined>(undefined);

export const SideContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<ReactNode | null>(null);
  const [title, setTitle] = useState<string>('Дополнительно');

  return (
    <SideContentContext.Provider value={{ content, setContent, title, setTitle }}>
      {children}
    </SideContentContext.Provider>
  );
};

export const useSideContent = () => {
  const context = useContext(SideContentContext);
  if (context === undefined) {
    // Возвращаем заглушку вместо undefined для предотвращения блокировки рендеринга
    return {
      content: null,
      setContent: () => {},
      title: 'Дополнительно',
      setTitle: () => {},
    };
  }
  return context;
}; 