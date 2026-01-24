-- Таблица для отслеживания прочтения активности
CREATE TABLE IF NOT EXISTS activity_read_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES activity_feed(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Уникальность - один пользователь может прочитать активность только один раз
    UNIQUE(user_id, activity_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_activity_read_user_id ON activity_read_status(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_read_activity_id ON activity_read_status(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_read_is_read ON activity_read_status(is_read);

-- Функция для автоматического создания записи о прочтении
CREATE OR REPLACE FUNCTION mark_activity_as_read(
    p_user_id UUID,
    p_activity_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO activity_read_status (user_id, activity_id, is_read, read_at)
    VALUES (p_user_id, p_activity_id, true, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, activity_id) 
    DO UPDATE SET 
        is_read = true,
        read_at = CURRENT_TIMESTAMP;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;
