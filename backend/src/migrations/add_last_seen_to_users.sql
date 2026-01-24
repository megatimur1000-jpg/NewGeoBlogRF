-- Добавление поля last_seen в таблицу users
-- Выполнить в pgAdmin или через psql

-- Добавляем поле last_seen в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;

-- Создаём индекс для быстрого поиска по last_seen
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);

-- Проверяем структуру таблицы users
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;







