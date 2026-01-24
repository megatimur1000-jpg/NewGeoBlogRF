// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../api/auth';
import apiClient from '../api/apiClient';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  subscription_expires_at?: string;
  settings?: any;
  analytics_opt_out?: boolean;
  preferred_location?: {
    city: string;
    region: string;
    latitude: number;
    longitude: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  register: (
    email: string, 
    username: string, 
    password: string, 
    phone: string,
    first_name?: string,
    last_name?: string,
    avatar_url?: string,
    bio?: string
  ) => Promise<any>;
  logout: () => void;
  updateUserAvatar: (avatarUrl: string) => Promise<void>;
  updatePreferredLocation: (location: { city: string; region: string; latitude: number; longitude: number }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Сохраняем компактный слепок пользователя с защитой от переполнения storage
function saveUserSnapshot(user: User) {
  const snapshot = JSON.stringify({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    avatar_url: user.avatar_url,
  });
  try {
    localStorage.setItem('user', snapshot);
    // если раньше использовали sessionStorage — очищаем маркер
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('user_in_session');
  } catch {
    // Переполнение localStorage — используем sessionStorage как запасной вариант
    try {
      sessionStorage.setItem('user', snapshot);
      sessionStorage.setItem('user_in_session', '1');
    } catch {
      // Если совсем нет места — просто не кэшируем, приложение продолжит работать из памяти
    }
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  // Синхронизируем токен с axios немедленно и загружаем профиль при старте
  useEffect(() => {
    if (token) {
      // Немедленно применяем заголовок Authorization для всех будущих запросов
      (apiClient.defaults.headers as any).Authorization = `Bearer ${token}`;
    } else {
      // Удаляем заголовок, если токена нет
      if ((apiClient.defaults.headers as any).Authorization) {
        delete (apiClient.defaults.headers as any).Authorization;
      }
    }

    // Автозагрузка профиля при наличии токена и отсутствии пользователя
    if (token && !user) {
      getProfile()
        .then((data) => {
          setUser(data.user);
          saveUserSnapshot(data.user);
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if ((apiClient.defaults.headers as any).Authorization) {
            delete (apiClient.defaults.headers as any).Authorization;
          }
        });
    }
  }, [token, user]);

  // Больше не чистим localStorage агрессивно на старте, чтобы не терять токен

  const login = async (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    (apiClient.defaults.headers as any).Authorization = `Bearer ${newToken}`;

    // Сразу загружаем профиль, чтобы не было "гостевого" состояния
    const data = await getProfile();
    setUser(data.user);
    saveUserSnapshot(data.user);
  };

  const register = async (
    email: string, 
    username: string, 
    password: string, 
    phone: string,
    first_name?: string,
    last_name?: string,
    avatar_url?: string,
    bio?: string
  ) => {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        username, 
        password, 
        phone,
        first_name,
        last_name,
        avatar_url,
        bio
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка регистрации');
    }

    const data = await response.json();
    
    // Если требуется верификация SMS, возвращаем данные без автоматического входа
    if (data.requiresVerification) {
      return data;
    }
    
    // Если верификация не требуется, входим автоматически
    await login(data.token);
    return data;
  };

  const logout = () => {
    console.log('🚪 Выход из аккаунта - очистка всех данных');
    setUser(null);
    setToken(null);
    
    // Очищаем localStorage полностью
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    
    // Очищаем sessionStorage тоже
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('user_in_session');
    
    // Удаляем заголовок Authorization из apiClient
    if ((apiClient.defaults.headers as any).Authorization) {
      delete (apiClient.defaults.headers as any).Authorization;
    }
    
    // Удаляем заголовок из всех будущих запросов
    delete (apiClient.defaults.headers as any).common?.Authorization;
    delete (apiClient.defaults.headers as any).Authorization;
    
    console.log('✅ Все данные очищены, пользователь вышел');
  };

  const updateUserAvatar = async (avatarUrl: string) => {
    try {
      const response = await apiClient.put('/users/avatar', { avatar_url: avatarUrl });
      setUser(response.data.user);
      // Сохраняем только необходимые данные пользователя
      saveUserSnapshot(response.data.user);
    } catch (error) {
      throw error;
    }
  };

  const updatePreferredLocation = (location: { city: string; region: string; latitude: number; longitude: number }) => {
    if (user) {
      const updatedUser = { ...user, preferred_location: location };
      setUser(updatedUser);
      
      // Сохраняем в localStorage
      // обновляем только локальный слепок; используем безопасный saver
      saveUserSnapshot(updatedUser as User);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUserAvatar, updatePreferredLocation }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Возвращаем заглушку вместо выбрасывания ошибки для предотвращения блокировки рендеринга
    return {
      user: null,
      token: null,
      login: async () => {},
      register: async () => ({}),
      logout: () => {},
      updateUserAvatar: async () => {},
      updatePreferredLocation: () => {},
    };
  }
  return ctx;
}