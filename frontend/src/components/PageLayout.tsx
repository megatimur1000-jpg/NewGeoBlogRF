import React, { ReactNode } from 'react';
import { FaTimes } from 'react-icons/fa';
import '../styles/PageLayout.css';

interface PageLayoutProps {
  children: ReactNode;
  mode?: 'map' | 'chat' | 'calendar' | 'default';
  title?: string;
  icon?: ReactNode;
  leftPanel?: {
    title: string;
    content: ReactNode;
    isOpen: boolean;
    onClose: () => void;
  };
  rightPanel?: {
    title: string;
    content: ReactNode;
    isOpen: boolean;
    onClose: () => void;
  };
  leftButton?: {
    icon: ReactNode;
    onClick: () => void;
    title: string;
  };
  rightButton?: {
    icon: ReactNode;
    onClick: () => void;
    title: string;
  };
  showHeader?: boolean;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  mode = 'default',
  title,
  icon,
  leftPanel,
  rightPanel,
  leftButton,
  rightButton,
  showHeader = false,
  className = ''
}) => {
  const hasPanels = leftPanel || rightPanel;
  const hasOverlay = (leftPanel?.isOpen || rightPanel?.isOpen);

  return (
    <div className={`page-container ${mode}-mode ${className}`}>
      {/* Заголовок страницы */}
      {showHeader && title && (
        <div className="page-header">
          <div className="flex items-center justify-center">
            {icon && <span className="mr-3">{icon}</span>}
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          </div>
        </div>
      )}

      {/* Основная область контента */}
      <div className="page-main-area">
        <div className="page-content-wrapper">
          <div className="page-main-panel relative">
            
            {/* Кнопки управления по бокам */}
            {leftButton && (
              <button
                className="page-side-button left"
                onClick={leftButton.onClick}
                title={leftButton.title}
              >
                {leftButton.icon}
              </button>
            )}

            {rightButton && (
              <button
                className="page-side-button right"
                onClick={rightButton.onClick}
                title={rightButton.title}
              >
                {rightButton.icon}
              </button>
            )}

            {/* Основной контент */}
            <div className="h-full relative">
              {children}

              {/* Левая выдвигающаяся панель */}
              {leftPanel && (
                <div className={`page-slide-panel left ${leftPanel.isOpen ? 'open' : ''}`}>
                  <div className="page-slide-panel-header left">
                    <h2 className="text-xl font-semibold">{leftPanel.title}</h2>
                    <button
                      className="page-slide-panel-close"
                      onClick={leftPanel.onClose}
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>
                  <div className="page-slide-panel-content">
                    {leftPanel.content}
                  </div>
                </div>
              )}

              {/* Правая выдвигающаяся панель */}
              {rightPanel && (
                <div className={`page-slide-panel right ${rightPanel.isOpen ? 'open' : ''}`}>
                  <div className="page-slide-panel-header right">
                    <h2 className="text-xl font-semibold">{rightPanel.title}</h2>
                    <button
                      className="page-slide-panel-close"
                      onClick={rightPanel.onClose}
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>
                  <div className="page-slide-panel-content">
                    {rightPanel.content}
                  </div>
                </div>
              )}

              {/* Затемнение при открытых панелях */}
              {hasPanels && (
                <div className={`page-overlay ${hasOverlay ? 'active' : ''}`} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLayout; 