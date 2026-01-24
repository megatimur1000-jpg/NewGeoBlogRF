-- Миграция: Добавление поля analytics_opt_out в таблицу users
-- Позволяет пользователям отказаться от сбора аналитических данных

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS analytics_opt_out BOOLEAN DEFAULT FALSE;

-- Комментарий к колонке
COMMENT ON COLUMN users.analytics_opt_out IS 'Флаг отказа от сбора аналитических данных. TRUE = пользователь отказался от трекинга';

-- Индекс для быстрого поиска пользователей с отключенной аналитикой
CREATE INDEX IF NOT EXISTS idx_users_analytics_opt_out ON users(analytics_opt_out) WHERE analytics_opt_out = TRUE;

