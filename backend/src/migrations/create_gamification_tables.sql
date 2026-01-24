-- Таблицы для системы геймификации
-- ИСКЛЮЧЕНЫ маршруты для предотвращения накруток

-- Таблица уровней пользователей
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_level_xp INTEGER NOT NULL DEFAULT 0,
  required_xp INTEGER NOT NULL DEFAULT 100,
  rank VARCHAR(20) NOT NULL DEFAULT 'novice',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);

-- Таблица истории XP (для отслеживания источников)
CREATE TABLE IF NOT EXISTS xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  content_id UUID,
  content_type VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для xp_history
CREATE INDEX IF NOT EXISTS idx_xp_history_user_id ON xp_history(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_source ON xp_history(source);
CREATE INDEX IF NOT EXISTS idx_xp_history_content ON xp_history(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_xp_history_created_at ON xp_history(created_at);

-- Таблица ежедневных целей
CREATE TABLE IF NOT EXISTS daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target INTEGER NOT NULL,
  current INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  xp_reward INTEGER NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  icon VARCHAR(50),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, goal_id, date)
);

-- Индексы для daily_goals
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_id ON daily_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_goals_date ON daily_goals(date);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON daily_goals(user_id, date);

-- Таблица истории ежедневных целей (стрик)
CREATE TABLE IF NOT EXISTS daily_goals_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  all_completed BOOLEAN NOT NULL DEFAULT FALSE,
  streak INTEGER NOT NULL DEFAULT 0,
  reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Индексы для daily_goals_history
CREATE INDEX IF NOT EXISTS idx_daily_goals_history_user_id ON daily_goals_history(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_goals_history_date ON daily_goals_history(date);

-- Таблица достижений пользователей
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) NOT NULL,
  unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at TIMESTAMP,
  progress_current INTEGER NOT NULL DEFAULT 0,
  progress_target INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

-- Добавляем столбец unlocked, если его нет (для существующих таблиц)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_achievements' AND column_name = 'unlocked'
  ) THEN
    ALTER TABLE user_achievements ADD COLUMN unlocked BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- Индексы для user_achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
-- Создаем индекс только если столбец существует
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_achievements' AND column_name = 'unlocked'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(unlocked);
  END IF;
END $$;

-- Таблица действий для проверки уникальности (защита от накруток)
CREATE TABLE IF NOT EXISTS gamification_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(50) NOT NULL,
  content_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, source, content_id)
);

-- Индексы для gamification_actions
CREATE INDEX IF NOT EXISTS idx_gamification_actions_user_id ON gamification_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_actions_source ON gamification_actions(source);
CREATE INDEX IF NOT EXISTS idx_gamification_actions_content ON gamification_actions(content_id);
CREATE INDEX IF NOT EXISTS idx_gamification_actions_created_at ON gamification_actions(created_at);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_user_levels_updated_at BEFORE UPDATE ON user_levels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_goals_updated_at BEFORE UPDATE ON daily_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_goals_history_updated_at BEFORE UPDATE ON daily_goals_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON user_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

