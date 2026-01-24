import { useAuth } from '../contexts/AuthContext';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

// Функция для получения ID текущего пользователя
export const getCurrentUserId = (): string => {
  // Эта функция должна вызываться только из компонентов React
  throw new Error('getCurrentUserId must be called from a React component');
};

// Функция для получения текущего пользователя
export const getCurrentUser = (): User | null => {
  // Эта функция должна вызываться только из компонентов React
  throw new Error('getCurrentUser must be called from a React component');
};

// Проверка авторизации
export const isAuthenticated = (): boolean => {
  // Эта функция должна вызываться только из компонентов React
  throw new Error('isAuthenticated must be called from a React component');
};

// Выход из системы
export const logout = (): void => {
  // Эта функция должна вызываться только из компонентов React
  throw new Error('logout must be called from a React component');
};

// Функция для хуков (использует AuthContext)
export const useAuthUtils = () => {
  const authContext = useAuth();
  
  if (!authContext) {
    return {
      user: null,
      token: null,
      login: () => {},
      logout: () => {},
      getCurrentUserId: () => null,
      isAuthenticated: () => false
    };
  }
  
  const { user, token, login, logout } = authContext;
  
  return {
    user,
    token,
    login,
    logout,
    getCurrentUserId: () => user?.id,
    isAuthenticated: () => !!user
  };
}; 