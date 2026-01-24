-- Скрипт для удаления некачественных маркеров
-- Удаляем маркеры с пустыми, короткими или некачественными названиями

-- Показываем количество маркеров до очистки
SELECT 'До очистки' as status, COUNT(*) as count FROM map_markers;

-- Удаляем маркеры с проблемными названиями
DELETE FROM map_markers 
WHERE 
  title IS NULL 
  OR title = '' 
  OR LENGTH(TRIM(title)) < 3
  OR title = 'Без названия'
  OR title = 'Unnamed'
  OR title = 'Неизвестно'
  OR title = 'Неизвестное место'
  OR title ILIKE '%магазин%'
  OR title ILIKE '%кафе%'
  OR title ILIKE '%ресторан%'
  OR title ILIKE '%отель%'
  OR title ILIKE '%парк%'
  OR title ILIKE '%сквер%'
  OR title ILIKE '%площадь%'
  OR title ILIKE '%улица%'
  OR title ILIKE '%дом%'
  OR title ILIKE '%здание%'
  OR title ILIKE '%сооружение%'
  OR title ILIKE '%объект%'
  OR title ILIKE '%место%'
  OR title ILIKE '%точка%'
  OR title ILIKE '%shop%'
  OR title ILIKE '%cafe%'
  OR title ILIKE '%restaurant%'
  OR title ILIKE '%hotel%'
  OR title ILIKE '%park%'
  OR title ILIKE '%square%'
  OR title ILIKE '%street%'
  OR title ILIKE '%building%'
  OR title ILIKE '%structure%'
  OR title ILIKE '%object%'
  OR title ILIKE '%place%'
  OR title ILIKE '%point%'
  OR title ILIKE '%unnamed%'
  OR title ILIKE '%без названия%'
  OR title ILIKE '%неизвестно%'
  OR title ILIKE '%???%'
  OR title ILIKE '%...%'
  OR title ~ '^[0-9]+$'  -- только цифры
  OR NOT (title ~ '[а-яёa-z]');  -- без букв

-- Показываем количество маркеров после очистки
SELECT 'После очистки' as status, COUNT(*) as count FROM map_markers;

-- Показываем примеры оставшихся маркеров
SELECT 'Примеры качественных маркеров:' as info;
SELECT id, title, category, subcategory 
FROM map_markers 
ORDER BY id 
LIMIT 10;
