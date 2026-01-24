// frontend/src/pages/RegisterPage.tsx
import { useState } from 'react';
import { register as apiRegister } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiRegister(email, username, password, phone);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Регистрация</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Имя пользователя" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" required />
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Телефон" required />
      <button type="submit">Зарегистрироваться</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}