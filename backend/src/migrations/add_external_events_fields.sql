-- Добавление полей для внешних событий в таблицу events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS external_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS external_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS attendees_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS price VARCHAR(100),
ADD COLUMN IF NOT EXISTS organizer VARCHAR(255),
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_events_external_id ON events(external_id);
CREATE INDEX IF NOT EXISTS idx_events_external_source ON events(external_source);
CREATE INDEX IF NOT EXISTS idx_events_date_range ON events(date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(latitude, longitude);

-- Добавление комментариев к полям
COMMENT ON COLUMN events.external_id IS 'ID события во внешней системе';
COMMENT ON COLUMN events.external_source IS 'Источник события (google, eventbrite, meetup, facebook)';
COMMENT ON COLUMN events.external_url IS 'URL события на сайте источника';
COMMENT ON COLUMN events.image_url IS 'URL изображения события';
COMMENT ON COLUMN events.attendees_count IS 'Количество участников';
COMMENT ON COLUMN events.price IS 'Цена билета';
COMMENT ON COLUMN events.organizer IS 'Организатор события';
COMMENT ON COLUMN events.end_date IS 'Дата и время окончания события';
COMMENT ON COLUMN events.latitude IS 'Широта места проведения';
COMMENT ON COLUMN events.longitude IS 'Долгота места проведения';


