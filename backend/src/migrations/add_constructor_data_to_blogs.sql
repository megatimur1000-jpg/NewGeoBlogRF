-- Добавление поля constructor_data для хранения данных конструктора блогов
-- Это поле будет содержать JSON с данными о параграфах, состояниях и структуре блога

ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS constructor_data JSONB DEFAULT '{}';

-- Создание индекса для быстрого поиска по JSON полю
CREATE INDEX IF NOT EXISTS idx_blog_posts_constructor_data 
ON blog_posts USING GIN (constructor_data);

-- Комментарий к полю
COMMENT ON COLUMN blog_posts.constructor_data IS 'JSON данные конструктора блога (параграфы, состояния, структура)';



