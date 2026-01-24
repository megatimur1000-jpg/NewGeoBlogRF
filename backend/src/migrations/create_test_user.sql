-- Создание тестового пользователя test@example.com
-- Выполнить в pgAdmin или через psql

-- Создаем тестового пользователя с правильным хешем пароля
INSERT INTO users (username, email, password_hash, created_at, last_seen) VALUES 
('testuser', 'test@example.com', '$2b$10$rQZ8K9vL3mN2pQ1sT5uYCOvK8jH7gF4dE6cB3aM9nL2pQ1sT5uYCO', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  last_seen = NOW();

-- Проверяем созданного пользователя
SELECT id, username, email, created_at, last_seen FROM users WHERE email = 'test@example.com';




-- Выполнить в pgAdmin или через psql

-- Создаем тестового пользователя с правильным хешем пароля
INSERT INTO users (username, email, password_hash, created_at, last_seen) VALUES 
('testuser', 'test@example.com', '$2b$10$rQZ8K9vL3mN2pQ1sT5uYCOvK8jH7gF4dE6cB3aM9nL2pQ1sT5uYCO', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  last_seen = NOW();

-- Проверяем созданного пользователя
SELECT id, username, email, created_at, last_seen FROM users WHERE email = 'test@example.com';





























































































