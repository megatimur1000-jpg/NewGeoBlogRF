-- Создание таблицы для реакций на сообщения
CREATE TABLE IF NOT EXISTS message_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    user_id INTEGER NOT NULL,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Уникальность: один пользователь может поставить только одну реакцию определенного типа на сообщение
    UNIQUE(message_id, user_id, emoji),
    
    -- Внешний ключ на сообщения
    FOREIGN KEY (message_id) REFERENCES hashtag_chat_messages(id) ON DELETE CASCADE
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_emoji ON message_reactions(emoji);

-- Добавление поля updated_at в таблицу сообщений (если его нет)
ALTER TABLE hashtag_chat_messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hashtag_chat_messages_updated_at 
    BEFORE UPDATE ON hashtag_chat_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблицам
COMMENT ON TABLE message_reactions IS 'Реакции пользователей на сообщения в чате';
COMMENT ON COLUMN message_reactions.message_id IS 'ID сообщения, на которое поставлена реакция';
COMMENT ON COLUMN message_reactions.emoji IS 'Эмодзи-реакция';
COMMENT ON COLUMN message_reactions.user_id IS 'ID пользователя, поставившего реакцию';
COMMENT ON COLUMN message_reactions.username IS 'Имя пользователя, поставившего реакцию';
COMMENT ON COLUMN message_reactions.created_at IS 'Время постановки реакции';
