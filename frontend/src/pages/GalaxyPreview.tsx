import './GalaxyPreview.css';

// Дорожная карта будущих патчей Центра влияния
const roadmap = [
  {
    title: 'Вращающиеся достижения',
    status: 'done',
    description: 'Откройте новые анимированные достижения с 3D-эффектами и вращением.',
  },
  {
    title: 'Голографический подиум',
    status: 'soon',
    description: 'Скоро: персональный подиум с неоновыми и голографическими эффектами.',
  },
  {
    title: 'Созвездия друзей',
    status: 'in-progress',
    description: 'В разработке: визуализация вашей сети влияния в виде созвездий.',
  },
  {
    title: 'Галактический чат',
    status: 'planned',
    description: 'Планируется: чат с анимированными частицами и космическими темами.',
  },
];

const statusLabels: Record<string, string> = {
  done: '✔️ Открыто',
  soon: '🕒 Скоро',
  'in-progress': '🔧 В разработке',
  planned: '🔒 В планах',
};

export default function GalaxyPreview() {
  return (
    <div className="galaxy-preview">
      <h1>🌌 Галактический путь обновлений</h1>
      <p className="galaxy-preview__subtitle">
        Следите за развитием Центра влияния! Новые возможности уже на горизонте.
      </p>
      <ul className="galaxy-preview__roadmap">
        {roadmap.map((item, idx) => (
          <li key={idx} className={`galaxy-preview__item galaxy-preview__item--${item.status}`}>
            <div className="galaxy-preview__status">{statusLabels[item.status]}</div>
            <div className="galaxy-preview__title">{item.title}</div>
            <div className="galaxy-preview__desc">{item.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}