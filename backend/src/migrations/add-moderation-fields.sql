-- Миграция: Добавление полей модерации во все таблицы контента

-- 1. СОБЫТИЯ (Events) - уже есть status, добавляем остальные поля
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id);

-- 2. ПОСТЫ (Posts)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'hidden', 'draft')),
ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id);

-- 3. МАРШРУТЫ (Routes) - таблица travel_routes
ALTER TABLE travel_routes 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'rejected', 'hidden', 'draft')),
ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id);

-- 4. МЕТКИ/МАРКЕРЫ (Markers) - таблица map_markers
ALTER TABLE map_markers 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'rejected', 'hidden', 'draft')),
ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id);

-- 5. БЛОГИ (Blogs) - таблица blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'rejected', 'hidden', 'draft')),
ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id);

-- 6. КОММЕНТАРИИ (Comments) - если есть таблица comments
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comments') THEN
        ALTER TABLE comments 
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'rejected', 'hidden', 'draft')),
        ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
        ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id);
    END IF;
END $$;

-- 7. ЧАТЫ/СООБЩЕНИЯ (Chats) - если есть таблица chat_messages
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
        ALTER TABLE chat_messages 
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'rejected', 'hidden', 'draft')),
        ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
        ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id);
    END IF;
END $$;

-- Создаем индексы для быстрого поиска контента на модерации
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_routes_status ON travel_routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_created_at ON travel_routes(created_at);
CREATE INDEX IF NOT EXISTS idx_markers_status ON map_markers(status);
CREATE INDEX IF NOT EXISTS idx_markers_created_at ON map_markers(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- Комментарий к миграции
COMMENT ON COLUMN posts.status IS 'Статус модерации: pending, active, rejected, hidden, draft';
COMMENT ON COLUMN travel_routes.status IS 'Статус модерации: pending, active, rejected, hidden, draft';
COMMENT ON COLUMN map_markers.status IS 'Статус модерации: pending, active, rejected, hidden, draft';
COMMENT ON COLUMN blog_posts.status IS 'Статус модерации: pending, active, rejected, hidden, draft';
COMMENT ON COLUMN events.status IS 'Статус модерации: pending, active, rejected, hidden, draft';

