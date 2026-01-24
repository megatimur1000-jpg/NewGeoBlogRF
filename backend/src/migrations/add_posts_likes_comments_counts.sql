-- Миграция: Добавление колонок likes_count и comments_count в таблицу posts
-- Дата: 2025-10-31

-- Добавляем колонку likes_count (количество лайков)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'likes_count'
    ) THEN
        ALTER TABLE posts ADD COLUMN likes_count INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Добавляем колонку comments_count (количество комментариев)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'comments_count'
    ) THEN
        ALTER TABLE posts ADD COLUMN comments_count INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Обновляем существующие записи: устанавливаем 0 для существующих постов
UPDATE posts SET likes_count = 0 WHERE likes_count IS NULL;
UPDATE posts SET comments_count = 0 WHERE comments_count IS NULL;

-- Добавляем индексы для оптимизации сортировки
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON posts(likes_count);
CREATE INDEX IF NOT EXISTS idx_posts_comments_count ON posts(comments_count);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

