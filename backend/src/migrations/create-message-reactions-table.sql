-- Создание таблицы для реакций на сообщения
CREATE TABLE IF NOT EXISTS message_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction VARCHAR(10) NOT NULL, -- эмодзи или текст реакции (например: 👍, ❤️, 😂)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Уникальный индекс для предотвращения дублирования реакций от одного пользователя
    UNIQUE(message_id, user_id)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_created_at ON message_reactions(created_at);

-- Комментарии к таблице
COMMENT ON TABLE message_reactions IS 'Реакции пользователей на сообщения в чате';
COMMENT ON COLUMN message_reactions.message_id IS 'ID сообщения, на которое поставлена реакция';
COMMENT ON COLUMN message_reactions.user_id IS 'ID пользователя, поставившего реакцию';
COMMENT ON COLUMN message_reactions.reaction IS 'Тип реакции (эмодзи или текст)';
COMMENT ON COLUMN message_reactions.created_at IS 'Время создания реакции';

-- Триггер для обновления счетчика реакций в сообщениях (опционально)
CREATE OR REPLACE FUNCTION update_message_reactions_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Увеличиваем счетчик реакций
        UPDATE chat_messages 
        SET reactions_count = COALESCE(reactions_count, 0) + 1
        WHERE id = NEW.message_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Уменьшаем счетчик реакций
        UPDATE chat_messages 
        SET reactions_count = GREATEST(COALESCE(reactions_count, 0) - 1, 0)
        WHERE id = OLD.message_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер
CREATE TRIGGER trigger_update_message_reactions_count
    AFTER INSERT OR DELETE ON message_reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_message_reactions_count();

-- Добавляем колонку reactions_count в chat_messages если её нет
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'reactions_count'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN reactions_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Вставка тестовых данных (опционально)
-- INSERT INTO message_reactions (message_id, user_id, reaction) VALUES 
-- (1, 1, '👍'),
-- (1, 2, '❤️'),
-- (2, 1, '😂');
