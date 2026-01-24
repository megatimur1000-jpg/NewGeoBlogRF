import React from 'react';

// Простая регистрация функции navigateTo из DynamicLayout
// Другие компоненты вызывают хук useLayoutNavigation(), который возвращает { navigateTo }

type NavigateFn = ((view: any) => void) | undefined;

let registeredNavigate: NavigateFn = undefined;

export const registerLayoutNavigation = (fn?: NavigateFn) => {
  registeredNavigate = fn;
};

export const useLayoutNavigation = () => {
  return {
    navigateTo: (view: string) => {
      if (typeof registeredNavigate === 'function') {
        try {
          registeredNavigate(view as any);
        } catch (e) {
          // ignore
        }
      } else {
        console.warn('[useLayoutNavigation] navigateTo not registered');
      }
    }
  };
};

export default useLayoutNavigation;
