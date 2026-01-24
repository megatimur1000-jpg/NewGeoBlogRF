-- Создание таблиц для системы друзей
-- Выполнить в pgAdmin или через psql

-- 1. Таблица друзей
CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL,
    
    -- Уникальность дружбы между двумя пользователями
    UNIQUE(user_id, friend_id),
    
    -- Внешние ключи
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Таблица заявок в друзья
CREATE TABLE IF NOT EXISTS friend_requests (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    
    -- Уникальность заявки
    UNIQUE(from_user_id, to_user_id),
    
    -- Внешние ключи
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Таблица настроек приватности пользователей
CREATE TABLE IF NOT EXISTS user_privacy_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
    friend_requests_enabled BOOLEAN DEFAULT TRUE,
    show_location BOOLEAN DEFAULT TRUE,
    show_favorites BOOLEAN DEFAULT TRUE,
    show_friends_list BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    
    -- Внешний ключ
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создание индексов для быстрой работы
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX IF NOT EXISTS idx_friends_created_at ON friends(created_at);

CREATE INDEX IF NOT EXISTS idx_friend_requests_from_user_id ON friend_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user_id ON friend_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_created_at ON friend_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_user_privacy_settings_user_id ON user_privacy_settings(user_id);

-- Добавление поля last_seen в таблицу users (если его нет)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;

-- Создание индекса для last_seen
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);

-- Вставка тестовых данных (опционально)
-- INSERT INTO users (username, email, password_hash) VALUES 
-- ('testuser1', 'test1@example.com', 'hash1'),
-- ('testuser2', 'test2@example.com', 'hash2'),
-- ('testuser3', 'test3@example.com', 'hash3')
-- ON CONFLICT (email) DO NOTHING;

-- Проверка создания таблиц
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('friends', 'friend_requests', 'user_privacy_settings')
ORDER BY table_name, ordinal_position;
