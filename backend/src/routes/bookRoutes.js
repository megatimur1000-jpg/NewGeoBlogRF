import express from 'express';
import {
  createBooksTable,
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  addBlogToBook,
  removeBlogFromBook
} from '../controllers/bookController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Специальный endpoint для создания таблицы (только для разработки)
router.post('/init-table', createBooksTable);

// Публичные маршруты
router.get('/', getBooks);
router.get('/:id', getBookById);

// Защищенные маршруты (требуют аутентификации)
router.post('/', authenticateToken, createBook);
router.put('/:id', authenticateToken, updateBook);
router.delete('/:id', authenticateToken, deleteBook);

// Маршруты для управления блогами в книгах
router.post('/:bookId/blogs/:blogId', authenticateToken, addBlogToBook);
router.delete('/:bookId/blogs/:blogId', authenticateToken, removeBlogFromBook);

export default router;

