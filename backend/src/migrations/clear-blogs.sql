-- Очистка всех блогов
DELETE FROM blog_posts;

-- Сброс автоинкремента
ALTER SEQUENCE blog_posts_id_seq RESTART WITH 1;

-- Проверка
SELECT COUNT(*) as remaining_blogs FROM blog_posts;
