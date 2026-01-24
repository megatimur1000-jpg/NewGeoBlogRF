-- Скрипт для полного удаления всех маркеров из базы данных
-- ВНИМАНИЕ: Этот скрипт удалит ВСЕ данные маркеров, маршрутов и связанные записи!

-- Отключаем проверки внешних ключей временно
SET session_replication_role = replica;

-- Удаляем все связанные данные в правильном порядке

-- 1. Удаляем точки маршрутов (waypoints)
DELETE FROM route_waypoints;

-- 2. Удаляем все маршруты
DELETE FROM travel_routes;

-- 3. Удаляем связи избранного с маркерами (если таблица существует)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_favorites') THEN
        DELETE FROM user_favorites WHERE marker_id IS NOT NULL;
    END IF;
END $$;

-- 4. Удаляем связи блогов с маркерами (если таблица существует)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_markers') THEN
        DELETE FROM blog_markers;
    END IF;
END $$;

-- 5. Удаляем все записи полноты маркеров (если таблица существует)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marker_completeness') THEN
        DELETE FROM marker_completeness;
    END IF;
END $$;

-- 6. Удаляем все метаданные маркеров (если таблица существует)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marker_metadata') THEN
        DELETE FROM marker_metadata;
    END IF;
END $$;

-- 7. Удаляем все маркеры
DELETE FROM map_markers;

-- Включаем обратно проверки внешних ключей
SET session_replication_role = DEFAULT;

-- Сбрасываем счетчики последовательностей (если существуют)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'map_markers_id_seq') THEN
        ALTER SEQUENCE map_markers_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'travel_routes_id_seq') THEN
        ALTER SEQUENCE travel_routes_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'route_waypoints_id_seq') THEN
        ALTER SEQUENCE route_waypoints_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'marker_completeness_id_seq') THEN
        ALTER SEQUENCE marker_completeness_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'marker_metadata_id_seq') THEN
        ALTER SEQUENCE marker_metadata_id_seq RESTART WITH 1;
    END IF;
END $$;

-- Показываем статистику
SELECT 
    'map_markers' as table_name, 
    COUNT(*) as remaining_records 
FROM map_markers
UNION ALL
SELECT 
    'travel_routes' as table_name, 
    COUNT(*) as remaining_records 
FROM travel_routes
UNION ALL
SELECT 
    'route_waypoints' as table_name, 
    COUNT(*) as remaining_records 
FROM route_waypoints;

-- Сообщение о завершении
SELECT 'Все маркеры и связанные данные успешно удалены!' as status;
