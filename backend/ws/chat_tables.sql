-- SQL для создания таблиц чата по хэштегам

-- Таблица комнат чата (хэштеги)
CREATE TABLE IF NOT EXISTS `chat_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hashtag` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `online_users` int(11) NOT NULL DEFAULT '0',
  `last_activity` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hashtag` (`hashtag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица сообщений чата
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `hashtag` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `hashtag` (`hashtag`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Добавляем несколько тестовых хэштегов (комнат)
INSERT INTO `chat_rooms` (`hashtag`, `title`, `description`, `online_users`) VALUES
('Походы', '#Походы', 'Обсуждение походов, маршрутов и снаряжения', 0),
('Еда', '#Еда', 'Обсуждение местных кухонь и интересных ресторанов', 0),
('Города', '#Города', 'Обсуждение городов, достопримечательностей и экскурсий', 0),
('Природа', '#Природа', 'Обсуждение природных достопримечательностей и маршрутов', 0),
('Культура', '#Культура', 'Обсуждение местных традиций, праздников и искусства', 0);

-- Добавляем несколько тестовых сообщений
INSERT INTO `chat_messages` (`user_id`, `hashtag`, `message`) VALUES
(1, 'Походы', 'Привет всем! Кто-нибудь ходил в поход на Алтай?'),
(2, 'Походы', 'Да, я был там в прошлом году. Очень красивые места!'),
(1, 'Походы', 'Какой маршрут можешь порекомендовать для начинающих?'),
(3, 'Еда', 'Подскажите хорошие рестораны в Питере с аутентичной русской кухней'),
(4, 'Еда', 'Обязательно попробуйте "Русскую рюмочную №1" на Конюшенной площади'),
(5, 'Города', 'Планирую поездку в Казань на 3 дня. Что обязательно стоит посмотреть?'),
(6, 'Природа', 'Кто-нибудь был на Байкале? Какое лучшее время для посещения?'),
(7, 'Культура', 'Подскажите интересные музеи в Москве, кроме стандартных туристических'),
(8, 'Культура', 'Рекомендую Музей советских игровых автоматов и Музей ретро-автомобилей'); 