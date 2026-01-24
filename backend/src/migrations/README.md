# Миграции базы данных

## Добавление колонок likes_count и comments_count в таблицу posts

### Выполнение миграции

Выполните миграцию одним из способов:

#### Способ 1: Через Node.js скрипт
```bash
cd backend
node src/migrations/run_migration.js
```

#### Способ 2: Через psql
```bash
psql -U bestuser_temp -d bestsite -f src/migrations/add_posts_likes_comments_counts.sql
```

#### Способ 3: Вручную через клиент PostgreSQL
Скопируйте содержимое файла `add_posts_likes_comments_counts.sql` и выполните в вашем клиенте PostgreSQL.

### Что делает миграция

1. Добавляет колонку `likes_count INTEGER DEFAULT 0 NOT NULL` в таблицу `posts`
2. Добавляет колонку `comments_count INTEGER DEFAULT 0 NOT NULL` в таблицу `posts`
3. Устанавливает значение 0 для всех существующих записей
4. Создает индексы для оптимизации запросов:
   - `idx_posts_likes_count` - для сортировки по лайкам
   - `idx_posts_comments_count` - для сортировки по комментариям
   - `idx_posts_created_at` - для сортировки по дате создания

### Безопасность

Миграция использует проверку `IF NOT EXISTS`, поэтому её можно запускать несколько раз без ошибок. Если колонки уже существуют, они не будут пересозданы.

