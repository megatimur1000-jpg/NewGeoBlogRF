// frontend/src/pages/ProfilePage.tsx
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const authContext = useAuth();
  const user = authContext?.user;
  const logout = authContext?.logout;

  if (!user) return <div>Загрузка...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Личный кабинет</h2>
      <div>
        <b>Email:</b> {user.email}<br />
        <b>Имя пользователя:</b> {user.username}<br />
        <b>Роль:</b> {user.role}
      </div>
      <hr style={{ margin: '16px 0' }} />

      <section>
        <h3>Достижения</h3>
        <p>Здесь будут отображаться ваши достижения, награды и прогресс.</p>
        {/* В будущем: список достижений, прогрессбар, иконки и т.д. */}
      </section>

      <section>
        <h3>Центр влияния</h3>
        <p>
          <b>Ваша персональная галактика достижений, квесты, лидерборды и многое другое!</b>
        </p>
        {/* В будущем: визуализация, переход в CentrePage и т.д. */}
      </section>

      <button onClick={logout} style={{ marginTop: 24 }}>Выйти</button>
    </div>
  );
}
