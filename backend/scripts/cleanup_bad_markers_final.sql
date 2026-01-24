-- Скрипт для очистки проблемных маркеров из базы данных
-- Удаляет метки с пустыми названиями, "Без названия" и другие некачественные маркеры

-- Показываем количество маркеров до очистки
SELECT 'До очистки' as status, COUNT(*) as count FROM map_markers;

-- Показываем проблемные маркеры перед удалением
SELECT 'Проблемные маркеры:' as info;
SELECT id, title, category, subcategory, created_at 
FROM map_markers 
WHERE title IS NULL 
   OR title = '' 
   OR LENGTH(TRIM(title)) < 3 
   OR title = 'Без названия' 
   OR title = 'Unnamed' 
   OR title = 'Неизвестно' 
   OR title = 'Неизвестное место'
   OR title ILIKE '%???%' 
   OR title ILIKE '%...%' 
   OR title ILIKE '%без названия%' 
   OR title ILIKE '%unnamed%' 
   OR title ILIKE '%неизвестно%'
   OR title ~ '^[0-9]+$' -- только цифры
   OR NOT (title ~ '[а-яёa-z]') -- без букв
ORDER BY created_at DESC;

-- Удаляем проблемные маркеры
DELETE FROM map_markers 
WHERE title IS NULL 
   OR title = '' 
   OR LENGTH(TRIM(title)) < 3 
   OR title = 'Без названия' 
   OR title = 'Unnamed' 
   OR title = 'Неизвестно' 
   OR title = 'Неизвестное место'
   OR title ILIKE '%???%' 
   OR title ILIKE '%...%' 
   OR title ILIKE '%без названия%' 
   OR title ILIKE '%unnamed%' 
   OR title ILIKE '%неизвестно%'
   OR title ~ '^[0-9]+$' -- только цифры
   OR NOT (title ~ '[а-яёa-z]'); -- без букв

-- Показываем количество маркеров после очистки
SELECT 'После очистки' as status, COUNT(*) as count FROM map_markers;

-- Показываем примеры оставшихся качественных маркеров
SELECT 'Примеры качественных маркеров:' as info;
SELECT id, title, category, subcategory, created_at 
FROM map_markers 
ORDER BY created_at DESC 
LIMIT 10;

-- Статистика по категориям после очистки
SELECT 'Статистика по категориям:' as info;
SELECT category, COUNT(*) as count 
FROM map_markers 
GROUP BY category 
ORDER BY count DESC;