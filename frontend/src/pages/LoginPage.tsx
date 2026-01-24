// frontend/src/pages/LoginPage.tsx
import { useState } from 'react';
import { login as apiLogin } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await apiLogin(email, password);
      if (!data.token) {
        throw new Error('Токен не получен от сервера');
      }
      
      // Вызываем login из AuthContext
      await login(data.token);
      navigate('/');
    } catch (err: any) {
      console.error('Ошибка входа:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          (err.code === 'ECONNREFUSED' ? 'Сервер недоступен. Убедитесь, что бэкенд запущен на порту 3002.' : 'Ошибка входа');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Вход — ГеоБлог.РФ
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ГеоБлог.РФ — карта ваших путешествий и мест.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email адрес"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Пароль</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isFormValid && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Введите ваши данные для входа
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Офлайн‑режим ГеоБлог.РФ позволяет сохранять черновики, карты и избранные
              места на устройстве — вы можете просматривать ранее загруженные данные
              без интернета и публиковать записи, когда сеть восстановится. Это удобно
              для путешествий в отдалённых местах и при медленном соединении.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}