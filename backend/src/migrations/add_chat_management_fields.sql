-- Добавление полей для управления чатами в таблицу hashtag_chat_rooms
-- Выполнить в pgAdmin или через psql

-- Добавляем поле для архивирования
ALTER TABLE hashtag_chat_rooms 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Добавляем поле для мягкого удаления (время удаления)
ALTER TABLE hashtag_chat_rooms 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;

-- Добавляем поле для указания, кто удалил чат
ALTER TABLE hashtag_chat_rooms 
ADD COLUMN IF NOT EXISTS deleted_by INTEGER DEFAULT NULL;

-- Создаём индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_hashtag_chat_rooms_archived 
ON hashtag_chat_rooms(is_archived) 
WHERE is_archived = true;

CREATE INDEX IF NOT EXISTS idx_hashtag_chat_rooms_deleted 
ON hashtag_chat_rooms(deleted_at) 
WHERE deleted_at IS NOT NULL;

-- Обновляем существующие записи (если нужно)
UPDATE hashtag_chat_rooms 
SET is_archived = FALSE 
WHERE is_archived IS NULL;

-- Проверяем результат
SELECT 
  id, 
  hashtag, 
  title, 
  is_archived, 
  deleted_at, 
  deleted_by,
  created_at
FROM hashtag_chat_rooms 
ORDER BY id;
