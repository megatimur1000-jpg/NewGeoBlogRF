import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const authContext = useAuth();

  // Проверяем, что контекст загружен
  if (!authContext) {
    return (
      <nav>
        <Link to="/profile">Профиль</Link> |{' '}
        <Link to="/centre">Центр влияния</Link> |{' '}
        {/* Добавь другие разделы по мере необходимости */}
      </nav>
    );
  }

  const { user, logout } = authContext;

  return (
    <nav>
      <Link to="/profile">Профиль</Link> |{' '}
      <Link to="/centre">Центр влияния</Link> |{' '}
      {/* Добавь другие разделы по мере необходимости */}
      {user && <button onClick={logout}>Выйти</button>}
    </nav>
  );
}
