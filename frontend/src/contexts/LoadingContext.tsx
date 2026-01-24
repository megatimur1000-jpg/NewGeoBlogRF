import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

type LoadingContextType = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  resetLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const counterRef = useRef(0);
  const lastChangeRef = useRef<number>(Date.now());
  const [, setTick] = useState(0);

  const tick = useCallback(() => setTick((t) => t + 1), []);

  const startLoading = useCallback(() => {
    counterRef.current += 1;
    lastChangeRef.current = Date.now();
    tick();
  }, [tick]);

  const stopLoading = useCallback(() => {
    counterRef.current = Math.max(0, counterRef.current - 1);
    lastChangeRef.current = Date.now();
    tick();
  }, [tick]);

  const resetLoading = useCallback(() => {
    counterRef.current = 0;
    lastChangeRef.current = Date.now();
    tick();
  }, [tick]);

  // Watchdog: если загрузка "залипла" дольше 15s, сбрасываем
  useEffect(() => {
    const id = setInterval(() => {
      try {
        const age = Date.now() - lastChangeRef.current;
        if (counterRef.current > 0 && age > 15000) {
          counterRef.current = 0;
          tick();
        }
      } catch (e) {
        // ignore
      }
    }, 5000);
    return () => clearInterval(id);
  }, [tick]);

  const value: LoadingContextType = {
    isLoading: counterRef.current > 0,
    startLoading,
    stopLoading,
    resetLoading
  };

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

export const useLoading = (): LoadingContextType => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
};

export default LoadingContext;
