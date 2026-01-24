-- Создание тестовых пользователей для системы друзей (исправленная версия)
-- Выполнить в pgAdmin или через psql ПОСЛЕ выполнения add_last_seen_to_users.sql

-- Добавляем тестовых пользователей (если их нет)
INSERT INTO users (username, email, password_hash, created_at) VALUES 
('testuser1', 'test1@example.com', 'hash1', NOW()),
('testuser2', 'test2@example.com', 'hash2', NOW()),
('testuser3', 'test3@example.com', 'hash3', NOW()),
('alice', 'alice@example.com', 'hash4', NOW()),
('bob', 'bob@example.com', 'hash5', NOW()),
('charlie', 'charlie@example.com', 'hash6', NOW())
ON CONFLICT (email) DO NOTHING;

-- Обновляем last_seen для некоторых пользователей (чтобы показать онлайн статус)
UPDATE users SET last_seen = NOW() - INTERVAL '2 minutes' WHERE username = 'testuser1';
UPDATE users SET last_seen = NOW() - INTERVAL '30 minutes' WHERE username = 'testuser2';
UPDATE users SET last_seen = NOW() - INTERVAL '2 hours' WHERE username = 'testuser3';

-- Проверяем созданных пользователей
SELECT id, username, email, last_seen FROM users WHERE username LIKE 'testuser%' OR username IN ('alice', 'bob', 'charlie') ORDER BY id;







