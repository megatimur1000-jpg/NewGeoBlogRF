import pool from '../../db.js';

// Создать таблицу books (для инициализации)
export const createBooksTable = async (req, res) => {
  try {
    // Создаем таблицу books
    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image_url TEXT,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        author_name VARCHAR(255),
        author_avatar TEXT,
        category VARCHAR(50) NOT NULL DEFAULT 'mixed' CHECK (category IN (
          'attractions', 'events', 'mixed', 'routes', 
          'nature', 'culture', 'adventure'
        )),
        rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
        ratings_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        is_favorite BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Добавляем поле book_id в таблицу blog_posts
    await pool.query(`
      ALTER TABLE blog_posts 
      ADD COLUMN IF NOT EXISTS book_id UUID REFERENCES books(id) ON DELETE SET NULL
    `);
    
    // Создаем индексы
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
      CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
      CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
      CREATE INDEX IF NOT EXISTS idx_books_rating ON books(rating);
      CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);
      CREATE INDEX IF NOT EXISTS idx_blog_posts_book_id ON blog_posts(book_id);
    `);
    
    // Создаем функцию для автоматического обновления updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_books_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Создаем триггер
    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_update_books_updated_at ON books;
      CREATE TRIGGER trigger_update_books_updated_at
          BEFORE UPDATE ON books
          FOR EACH ROW
          EXECUTE FUNCTION update_books_updated_at();
    `);
    
    // Проверяем результат
    const booksCount = await pool.query('SELECT COUNT(*) FROM books');
    const blogsWithBooks = await pool.query('SELECT COUNT(*) FROM blog_posts WHERE book_id IS NOT NULL');
    
    res.json({
      success: true,
      message: 'Таблица books создана успешно!',
      books_count: parseInt(booksCount.rows[0].count),
      blogs_with_books: parseInt(blogsWithBooks.rows[0].count)
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка при создании таблицы books',
      details: error.message 
    });
  }
};

// Получить все книги
export const getBooks = async (req, res) => {
  try {
    const query = `
      SELECT 
        b.*,
        COUNT(bp.id) as blogs_count,
        u.username as author_name,
        u.avatar_url as author_avatar
      FROM books b
      LEFT JOIN blog_posts bp ON b.id = bp.book_id
      LEFT JOIN users u ON b.author_id = u.id
      GROUP BY b.id, u.username, u.avatar_url
      ORDER BY b.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    // Преобразуем результат в формат, ожидаемый frontend
    const books = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      cover_image_url: row.cover_image_url,
      author_id: row.author_id,
      author_name: row.author_name,
      author_avatar: row.author_avatar,
      category: row.category,
      rating: parseFloat(row.rating) || 0,
      ratings_count: parseInt(row.ratings_count) || 0,
      views_count: parseInt(row.views_count) || 0,
      likes_count: parseInt(row.likes_count) || 0,
      is_favorite: row.is_favorite || false,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      blogs: [] // Блоги будут загружены отдельно
    }));
    
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получить книгу по ID
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Получаем информацию о книге
    const bookQuery = `
      SELECT 
        b.*,
        u.username as author_name,
        u.avatar_url as author_avatar
      FROM books b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.id = $1
    `;
    
    const bookResult = await pool.query(bookQuery, [id]);
    
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    
    // Получаем блоги этой книги
    const blogsQuery = `
      SELECT * FROM blog_posts 
      WHERE book_id = $1 
      ORDER BY created_at ASC
    `;
    
    const blogsResult = await pool.query(blogsQuery, [id]);
    
    const book = {
      ...bookResult.rows[0],
      author_name: bookResult.rows[0].author_name,
      author_avatar: bookResult.rows[0].author_avatar,
      rating: parseFloat(bookResult.rows[0].rating) || 0,
      ratings_count: parseInt(bookResult.rows[0].ratings_count) || 0,
      views_count: parseInt(bookResult.rows[0].views_count) || 0,
      likes_count: parseInt(bookResult.rows[0].likes_count) || 0,
      is_favorite: bookResult.rows[0].is_favorite || false,
      blogs: blogsResult.rows
    };
    
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Создать новую книгу
export const createBook = async (req, res) => {
  try {
    const {
      title,
      description,
      cover_image_url,
      category = 'mixed',
      status = 'draft'
    } = req.body;
    
    const author_id = req.user.id;
    
    const query = `
      INSERT INTO books (
        title, description, cover_image_url, author_id, category, status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [title, description, cover_image_url, author_id, category, status];
    const result = await pool.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновить книгу
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      cover_image_url,
      category,
      status
    } = req.body;
    
    const author_id = req.user.id;
    
    // Проверяем, что пользователь является автором книги
    const checkQuery = 'SELECT author_id FROM books WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    
    if (checkResult.rows[0].author_id !== author_id) {
      return res.status(403).json({ error: 'Нет прав для редактирования' });
    }
    
    const query = `
      UPDATE books SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        cover_image_url = COALESCE($3, cover_image_url),
        category = COALESCE($4, category),
        status = COALESCE($5, status),
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;
    
    const values = [title, description, cover_image_url, category, status, id];
    const result = await pool.query(query, values);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удалить книгу
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const author_id = req.user.id;
    
    // Проверяем, что пользователь является автором книги
    const checkQuery = 'SELECT author_id FROM books WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    
    if (checkResult.rows[0].author_id !== author_id) {
      return res.status(403).json({ error: 'Нет прав для удаления' });
    }
    
    // Удаляем книгу (блоги остаются, но теряют связь с книгой)
    await pool.query('DELETE FROM books WHERE id = $1', [id]);
    
    res.json({ message: 'Книга удалена успешно' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Добавить блог в книгу
export const addBlogToBook = async (req, res) => {
  try {
    const { bookId, blogId } = req.params;
    const author_id = req.user.id;
    
    // Проверяем, что пользователь является автором книги
    const bookQuery = 'SELECT author_id FROM books WHERE id = $1';
    const bookResult = await pool.query(bookQuery, [bookId]);
    
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    
    if (bookResult.rows[0].author_id !== author_id) {
      return res.status(403).json({ error: 'Нет прав для редактирования книги' });
    }
    
    // Проверяем, что пользователь является автором блога
    const blogQuery = 'SELECT author_id FROM blog_posts WHERE id = $1';
    const blogResult = await pool.query(blogQuery, [blogId]);
    
    if (blogResult.rows.length === 0) {
      return res.status(404).json({ error: 'Блог не найден' });
    }
    
    if (blogResult.rows[0].author_id !== author_id) {
      return res.status(403).json({ error: 'Нет прав для редактирования блога' });
    }
    
    // Добавляем блог в книгу
    await pool.query(
      'UPDATE blog_posts SET book_id = $1 WHERE id = $2',
      [bookId, blogId]
    );
    
    res.json({ message: 'Блог добавлен в книгу' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удалить блог из книги
export const removeBlogFromBook = async (req, res) => {
  try {
    const { bookId, blogId } = req.params;
    const author_id = req.user.id;
    
    // Проверяем права доступа
    const bookQuery = 'SELECT author_id FROM books WHERE id = $1';
    const bookResult = await pool.query(bookQuery, [bookId]);
    
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    
    if (bookResult.rows[0].author_id !== author_id) {
      return res.status(403).json({ error: 'Нет прав для редактирования книги' });
    }
    
    // Удаляем связь блога с книгой
    await pool.query(
      'UPDATE blog_posts SET book_id = NULL WHERE id = $1 AND book_id = $2',
      [blogId, bookId]
    );
    
    res.json({ message: 'Блог удален из книги' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
