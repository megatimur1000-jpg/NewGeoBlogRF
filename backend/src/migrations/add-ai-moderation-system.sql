-- Миграция: Система полуавтоматической модерации с ИИ-помощником

-- Таблица для хранения решений ИИ и вердиктов админа
CREATE TABLE IF NOT EXISTS ai_moderation_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('events', 'posts', 'routes', 'markers', 'blogs', 'comments', 'chats')),
  content_id VARCHAR(255) NOT NULL,
  ai_suggestion VARCHAR(20) NOT NULL CHECK (ai_suggestion IN ('approve', 'reject', 'hide', 'review')),
  ai_confidence DECIMAL(3,2) NOT NULL CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  ai_reason TEXT,
  ai_category VARCHAR(50), -- spam, inappropriate, fake, safe
  ai_issues TEXT[], -- массив проблем, найденных ИИ
  admin_verdict VARCHAR(20) CHECK (admin_verdict IN ('correct', 'incorrect', 'pending')),
  admin_feedback TEXT, -- комментарий админа, если решение неправильное
  admin_id UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(content_type, content_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_ai_moderation_content ON ai_moderation_decisions(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_ai_moderation_verdict ON ai_moderation_decisions(admin_verdict);
CREATE INDEX IF NOT EXISTS idx_ai_moderation_created ON ai_moderation_decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_moderation_pending ON ai_moderation_decisions(admin_verdict) WHERE admin_verdict = 'pending';

-- Таблица для обучения ИИ на основе решений админа
CREATE TABLE IF NOT EXISTS ai_moderation_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES ai_moderation_decisions(id) ON DELETE CASCADE,
  content_text TEXT NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  ai_suggestion VARCHAR(20) NOT NULL,
  admin_verdict VARCHAR(20) NOT NULL,
  admin_feedback TEXT,
  learned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индекс для обучения
CREATE INDEX IF NOT EXISTS idx_ai_training_decision ON ai_moderation_training(decision_id);
CREATE INDEX IF NOT EXISTS idx_ai_training_type ON ai_moderation_training(content_type);

-- Комментарии
COMMENT ON TABLE ai_moderation_decisions IS 'Решения ИИ-помощника и вердикты админа';
COMMENT ON COLUMN ai_moderation_decisions.ai_suggestion IS 'Предложение ИИ: approve, reject, hide, review';
COMMENT ON COLUMN ai_moderation_decisions.ai_confidence IS 'Уверенность ИИ (0-1)';
COMMENT ON COLUMN ai_moderation_decisions.admin_verdict IS 'Вердикт админа: correct (правильно), incorrect (неправильно), pending (не проверено)';
COMMENT ON COLUMN ai_moderation_decisions.admin_feedback IS 'Комментарий админа для улучшения ИИ';

