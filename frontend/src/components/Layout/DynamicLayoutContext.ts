// Lightweight layout navigation registration (no React/JSX to avoid resolution issues)

export type NavigateFn = ((view: any) => void) | undefined;

let registeredNavigate: NavigateFn = undefined;

export const registerLayoutNavigation = (fn?: NavigateFn) => {
  registeredNavigate = fn;
};

export const useLayoutNavigation = () => {
  return {
    navigateTo: (view: any) => {
      if (typeof registeredNavigate === 'function') {
        try {
          registeredNavigate(view);
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
