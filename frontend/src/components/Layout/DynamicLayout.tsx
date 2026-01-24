// DynamicLayout.tsx
import React, { useState, useEffect } from 'react';
import { SidePanel } from '../ui/SidePanel';
import { registerLayoutNavigation } from './DynamicLayoutContext';
import './DynamicLayout.css';

// Типы для основного и бокового контента
type MainView = 'posts' | 'planner' | 'map' | 'activity';
type SidePanelContent = 'posts' | 'activity' | null;

interface DynamicLayoutProps {
  children: React.ReactNode;
}

const DynamicLayout: React.FC<DynamicLayoutProps> = ({ children }) => {
  const [mainView, setMainView] = useState<MainView>('posts');
  const [sidePanelContent, setSidePanelContent] = useState<SidePanelContent>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [lastViewBeforeMap, setLastViewBeforeMap] = useState<MainView>('posts');

  // Функция для перехода на новую основную страницу с сохранением предыдущей в панели
  const navigateTo = (view: MainView) => {
    // Если уже открыто то же самое — просто закрываем панель
    if (mainView === view && sidePanelOpen) {
      setSidePanelOpen(false);
      return;
    }

    // Сохраняем состояние перед переходом на map
    if (mainView !== 'map' && view === 'map') {
      setLastViewBeforeMap(mainView);
      setSidePanelContent('activity');
    } else if (mainView === 'map' && view !== 'map') {
      // Возвращаемся с карты на другой экран
      setSidePanelContent(mainView as SidePanelContent);
    } else if (mainView !== 'map') {
      // Обычные переходы между экранами
      setSidePanelContent(mainView as SidePanelContent);
    }
    
    // Устанавливаем новое основное представление
    setMainView(view);
    
    // Управление открытием панели
    if (view === 'map') {
      setSidePanelOpen(true);
    } else if (mainView !== 'map') {
      setSidePanelOpen(true);
    }
  };

  // Регистрируем функцию навигации в контексте, чтобы другие компоненты могли её вызывать
  useEffect(() => {
    registerLayoutNavigation(navigateTo);
    return () => registerLayoutNavigation(undefined);
  }, [navigateTo]);

  // Закрытие боковой панели
  const closeSidePanel = () => {
    setSidePanelOpen(false);
  };

  // Получаем заголовок для панели
  const getPanelTitle = (): string => {
    switch (sidePanelContent) {
      case 'posts': return 'Мои посты';
      case 'activity': return 'Лента активности';
      default: return '';
    }
  };

  // Эффект для обновления mainView при изменении children (при навигации)
  useEffect(() => {
    // Определяем текущий view по типу контента
    if (children && typeof children === 'object') {
      if ('type' in children) {
        const elementType = (children as any).type;
        if (elementType?.name === 'PostsPage') {
          setMainView('posts');
          // При первоначальной загрузке с posts - устанавливаем sidePanelContent в null
          if (sidePanelContent === null) {
            setLastViewBeforeMap('posts');
          }
        } else if (elementType?.name === 'Planner') {
          setMainView('planner');
        } else if (elementType?.name === 'MapPage') {
          setMainView('map');
        } else if (elementType?.name === 'Activity') {
          setMainView('activity');
        }
      }
    }
  }, [children]);

  // Получаем компонент для отображения в панели
  const getSidePanelContent = () => {
    // В реальной реализации здесь будет динамический импорт и рендеринг соответствующего компонента
    // Пока возвращаем простой placeholder
    if (!sidePanelContent) return null;
    
    return (
      <div className="side-panel-content">
        <h3>{getPanelTitle()}</h3>
        <div>Содержимое для {sidePanelContent}</div>
      </div>
    );
  };

  return (
    <div className="dynamic-layout">
      {/* Основное окно */}
      <main className="main-view" data-view={mainView}>
        {children}
      </main>

      {/* Боковая панель */}
      <SidePanel
        isOpen={sidePanelOpen}
        onClose={closeSidePanel}
        title={getPanelTitle()}
      >
        {getSidePanelContent()}
      </SidePanel>

      {/* Контекст для навигации (можно использовать через Context или передавать пропсами) */}
      <div style={{ display: 'none' }} data-layout-state={JSON.stringify({ mainView, sidePanelContent, sidePanelOpen })} />
    </div>
  );
};


// Экспортируем navigateTo для использования в других компонентах
// Навигация теперь экспортируется через DynamicLayoutContext
export default DynamicLayout;