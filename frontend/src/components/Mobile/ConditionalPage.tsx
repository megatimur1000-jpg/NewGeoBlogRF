import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import ErrorBoundary from '../ErrorBoundary';

// Компонент загрузки для десктопной версии
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Загрузка...</p>
    </div>
  </div>
);

interface ConditionalPageProps {
  mobile: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
  desktop: ComponentType<any>;
  [key: string]: any;
}

/**
 * Компонент для условного рендеринга мобильных/десктопных страниц
 */
const ConditionalPage: React.FC<ConditionalPageProps> = ({ mobile: MobileComponent, desktop: DesktopComponent, ...props }) => {
  const isMobile = useIsMobile();
  
  // Улучшенная проверка lazy компонента
  const isLazyComponent = (component: any): component is LazyExoticComponent<ComponentType<any>> => {
    if (!component || typeof component !== 'object') return false;
    // React.lazy создает объект с _payload или _result
    return '_payload' in component || '_result' in component || 
           (component.$$typeof && component.$$typeof.toString().includes('lazy'));
  };
  
  if (isMobile) {
    
    // Если компонент lazy, используем Suspense, иначе рендерим сразу
    if (isLazyComponent(MobileComponent)) {
      const LazyComponent = MobileComponent as LazyExoticComponent<ComponentType<any>>;
      return (
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Загрузка мобильной версии...</p>
              </div>
            </div>
          }>
            <LazyComponent {...props} />
          </Suspense>
        </ErrorBoundary>
      );
    } else {
      // Компонент не lazy, рендерим сразу
      const RegularComponent = MobileComponent as ComponentType<any>;
      return (
        <ErrorBoundary>
          <RegularComponent {...props} />
        </ErrorBoundary>
      );
    }
  }
  
  // Для десктопной версии
  
  if (isLazyComponent(DesktopComponent)) {
    const LazyDesktopComponent = DesktopComponent as LazyExoticComponent<ComponentType<any>>;
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <LazyDesktopComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  // Компонент не lazy - рендерим сразу, это критично для немедленной загрузки данных
  const RegularDesktopComponent = DesktopComponent as ComponentType<any>;
  return (
    <ErrorBoundary>
      <RegularDesktopComponent {...props} />
    </ErrorBoundary>
  );
};

export default ConditionalPage;

