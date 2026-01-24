-- Создание таблицы books для системы интерактивных книг блогов
-- Это критически важная часть MVP - без неё система книг не работает

CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(255),
    author_avatar TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'mixed' CHECK (category IN (
        'attractions', 'events', 'mixed', 'routes', 
        'nature', 'culture', 'adventure'
    )),
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    ratings_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Добавляем поле book_id в таблицу blog_posts для связи с книгами
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS book_id UUID REFERENCES books(id) ON DELETE SET NULL;

-- Создаем индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_rating ON books(rating);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_book_id ON blog_posts(book_id);

-- Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_books_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS trigger_update_books_updated_at ON books;
CREATE TRIGGER trigger_update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_books_updated_at();

-- Создаем функцию для автоматического подсчета блогов в книге
CREATE OR REPLACE FUNCTION update_book_blogs_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Обновляем счетчик блогов в книге при добавлении/удалении блога
    IF TG_OP = 'INSERT' AND NEW.book_id IS NOT NULL THEN
        UPDATE books 
        SET updated_at = NOW() 
        WHERE id = NEW.book_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Если book_id изменился
        IF OLD.book_id IS DISTINCT FROM NEW.book_id THEN
            IF OLD.book_id IS NOT NULL THEN
                UPDATE books 
                SET updated_at = NOW() 
                WHERE id = OLD.book_id;
            END IF;
            IF NEW.book_id IS NOT NULL THEN
                UPDATE books 
                SET updated_at = NOW() 
                WHERE id = NEW.book_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.book_id IS NOT NULL THEN
        UPDATE books 
        SET updated_at = NOW() 
        WHERE id = OLD.book_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления счетчика блогов
DROP TRIGGER IF EXISTS trigger_update_book_blogs_count ON blog_posts;
CREATE TRIGGER trigger_update_book_blogs_count
    AFTER INSERT OR UPDATE OR DELETE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_book_blogs_count();

-- Вставляем тестовые данные для проверки
INSERT INTO books (title, description, author_id, author_name, category, status) VALUES
('Мои первые путешествия', 'Коллекция блогов о первых поездках', 
 (SELECT id FROM users LIMIT 1), 'Тестовый пользователь', 'mixed', 'published'),
('Города России', 'Путеводитель по городам России', 
 (SELECT id FROM users LIMIT 1), 'Тестовый пользователь', 'attractions', 'published'),
('Природные красоты', 'Блоги о природных достопримечательностях', 
 (SELECT id FROM users LIMIT 1), 'Тестовый пользователь', 'nature', 'draft')
ON CONFLICT DO NOTHING;

-- Выводим информацию о созданных таблицах
SELECT 'Таблица books создана успешно!' as status;
SELECT COUNT(*) as books_count FROM books;
SELECT COUNT(*) as blog_posts_with_books FROM blog_posts WHERE book_id IS NOT NULL;

