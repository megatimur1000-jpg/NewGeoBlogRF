-- Проверка структуры таблиц для системы друзей
-- Выполнить в pgAdmin

-- Проверяем структуру таблицы friends
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'friends' 
ORDER BY ordinal_position;

-- Проверяем структуру таблицы friend_requests
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'friend_requests' 
ORDER BY ordinal_position;

-- Проверяем структуру таблицы users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;







