import { useEffect, useState, startTransition } from "react";
import { useContentStore } from "../stores/contentStore";

export function useIsMobile() {
  // Используем store для синхронизации состояния мобильной версии
  const storeIsMobile = useContentStore((state) => state.isMobile);
  const setIsMobileStore = useContentStore((state) => state.setIsMobile);

  // Инициализируем синхронно, чтобы избежать мигания десктопной версии
  const [isMobile, setIsMobile] = useState(() => {
    // Проверяем при первой инициализации
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const isMobileValue = width < 768;
      // Синхронизируем с store АСИНХРОННО
      if (storeIsMobile !== isMobileValue) {
        startTransition(() => {
          setIsMobileStore(isMobileValue);
        });
      }
      return isMobileValue;
    }
    return false;
  });

  useEffect(() => {
    const checkIsMobile = () => {
      const width = window.innerWidth;
      const newIsMobile = width < 768;
      setIsMobile(newIsMobile);
      // Синхронизируем с store АСИНХРОННО
      startTransition(() => {
        setIsMobileStore(newIsMobile);
      });
    };

    // Проверяем сразу при монтировании
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, [setIsMobileStore]);

  // Синхронизируем локальное состояние с store
  useEffect(() => {
    if (isMobile !== storeIsMobile) {
      setIsMobile(storeIsMobile);
    }
  }, [storeIsMobile, isMobile]);

  return isMobile;
}

