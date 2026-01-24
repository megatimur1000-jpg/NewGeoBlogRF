-- Миграция: Добавление/обновление колонки status в таблицу posts
-- Если колонка уже существует, обновляет значение по умолчанию и существующие записи

-- Проверяем наличие колонки status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
          AND column_name = 'status'
    ) THEN
        -- Добавляем колонку status с CHECK constraint
        ALTER TABLE posts 
        ADD COLUMN status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'active', 'rejected', 'hidden', 'awaiting_moderation'));
        
        -- Обновляем существующие посты: если статус NULL, устанавливаем 'pending'
        UPDATE posts 
        SET status = 'pending' 
        WHERE status IS NULL;
        
        -- Создаем индекс для быстрого поиска по статусу
        CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
        
        RAISE NOTICE 'Колонка status успешно добавлена в таблицу posts';
    ELSE
        -- Колонка уже существует - обновляем значение по умолчанию
        RAISE NOTICE 'Колонка status уже существует в таблице posts';
        
        -- Удаляем старое значение по умолчанию и устанавливаем новое
        ALTER TABLE posts 
        ALTER COLUMN status DROP DEFAULT;
        
        ALTER TABLE posts 
        ALTER COLUMN status SET DEFAULT 'pending';
        
        -- Обновляем существующие посты со статусом 'active', которые должны быть на модерации
        -- ВАЖНО: Обновляем только посты, которые были созданы недавно (за последние 24 часа)
        -- Это поможет вернуть в модерацию посты, которые были автоматически опубликованы
        UPDATE posts 
        SET status = 'pending' 
        WHERE status = 'active' 
          AND created_at > NOW() - INTERVAL '24 hours';
        
        RAISE NOTICE 'Значение по умолчанию для status обновлено на ''pending''';
        RAISE NOTICE 'Существующие активные посты (за последние 24 часа) переведены в ''pending'' для модерации';
    END IF;
END $$;

