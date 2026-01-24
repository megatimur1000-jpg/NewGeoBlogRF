-- SQL для создания таблиц чата по хэштегам (PostgreSQL версия)

-- Таблица комнат чата (хэштеги)
CREATE TABLE IF NOT EXISTS hashtag_chat_rooms (
  id SERIAL PRIMARY KEY,
  hashtag VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  online_users INTEGER NOT NULL DEFAULT 0,
  last_activity TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Таблица сообщений чата
CREATE TABLE IF NOT EXISTS hashtag_chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  hashtag VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_hashtag_chat_messages_hashtag ON hashtag_chat_messages(hashtag);
CREATE INDEX IF NOT EXISTS idx_hashtag_chat_messages_user_id ON hashtag_chat_messages(user_id);

-- Добавляем несколько тестовых хэштегов (комнат)
INSERT INTO hashtag_chat_rooms (hashtag, title, description, online_users) VALUES
('Походы', '#Походы', 'Обсуждение походов, маршрутов и снаряжения', 0),
('Еда', '#Еда', 'Обсуждение местных кухонь и интересных ресторанов', 0),
('Города', '#Города', 'Обсуждение городов, достопримечательностей и экскурсий', 0),
('Природа', '#Природа', 'Обсуждение природных достопримечательностей и маршрутов', 0),
('Культура', '#Культура', 'Обсуждение местных традиций, праздников и искусства', 0)
ON CONFLICT (hashtag) DO NOTHING;

-- Добавляем несколько тестовых сообщений
INSERT INTO hashtag_chat_messages (user_id, hashtag, message) VALUES
(1, 'Походы', 'Привет всем! Кто-нибудь ходил в поход на Алтай?'),
(2, 'Походы', 'Да, я был там в прошлом году. Очень красивые места!'),
(1, 'Походы', 'Какой маршрут можешь порекомендовать для начинающих?'),
(3, 'Еда', 'Подскажите хорошие рестораны в Питере с аутентичной русской кухней'),
(4, 'Еда', 'Обязательно попробуйте "Русскую рюмочную №1" на Конюшенной площади'),
(5, 'Города', 'Планирую поездку в Казань на 3 дня. Что обязательно стоит посмотреть?'),
(6, 'Природа', 'Кто-нибудь был на Байкале? Какое лучшее время для посещения?'),
(7, 'Культура', 'Подскажите интересные музеи в Москве, кроме стандартных туристических'),
(8, 'Культура', 'Рекомендую Музей советских игровых автоматов и Музей ретро-автомобилей');
