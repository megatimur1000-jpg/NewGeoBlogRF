import { User } from './user';

// Глобальный контекст пользователя
declare global {
  interface Window {
    currentUser: User | null;
  }
}

// Инициализация глобальной переменной
if (!window.currentUser) {
  window.currentUser = null;
}
