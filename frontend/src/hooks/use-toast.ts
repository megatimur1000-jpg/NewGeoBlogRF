import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface UseToastReturn {
  toast: (toast: Omit<Toast, 'id'>) => void;
  toasts: Toast[];
  dismiss: (id: string) => void;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...toastData, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Автоматически убираем toast через 5 секунд
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return { toast, toasts, dismiss };
};

// Экспортируем функцию toast из хука
export const toast = useToast().toast;





