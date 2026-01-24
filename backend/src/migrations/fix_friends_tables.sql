-- Исправление типов данных в таблицах друзей
-- Выполнить в pgAdmin

-- Сначала удаляем существующие таблицы (если они есть)
DROP TABLE IF EXISTS friend_requests CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS user_privacy_settings CASCADE;

-- Создаем таблицы с правильными типами данных

-- 1. Таблица друзей (с uuid типами)
CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    friend_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL,

    -- Уникальность дружбы между двумя пользователями
    UNIQUE(user_id, friend_id),

    -- Внешние ключи
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Таблица заявок в друзья (с uuid типами)
CREATE TABLE IF NOT EXISTS friend_requests (
    id SERIAL PRIMARY KEY,
    from_user_id UUID NOT NULL,
    to_user_id UUID NOT NULL,
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
    user_id UUID NOT NULL UNIQUE,
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

-- Проверка создания таблиц
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('friends', 'friend_requests', 'user_privacy_settings')
ORDER BY table_name, ordinal_position;







