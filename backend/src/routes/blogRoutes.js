import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getUserBlogs,
  getUserDrafts,
  saveDraft,
  updateDraft,
  likeBlog,
  unlikeBlog,
  clearAllBlogs
} from '../controllers/blogController.js';

const router = express.Router();

// Публичные роуты (не требуют авторизации)
router.get('/', getAllBlogs); // Получить все опубликованные блоги
router.get('/:id', getBlogById); // Получить блог по ID

// Защищенные роуты (требуют авторизации)
router.use(authenticateToken);

router.post('/', createBlog); // Создать новый блог
router.put('/:id', updateBlog); // Обновить блог
router.delete('/:id', deleteBlog); // Удалить блог
router.get('/user/blogs', getUserBlogs); // Получить блоги текущего пользователя

// Роуты для черновиков
router.get('/user/drafts', getUserDrafts); // Получить черновики пользователя
router.post('/drafts', saveDraft); // Сохранить черновик
router.put('/drafts/:id', updateDraft); // Обновить черновик

router.post('/:id/like', likeBlog); // Лайкнуть блог
router.delete('/:id/like', unlikeBlog); // Убрать лайк с блога

// ВРЕМЕННЫЙ РОУТ ДЛЯ ОЧИСТКИ (ТОЛЬКО ДЛЯ РАЗРАБОТКИ!)
router.delete('/clear-all', clearAllBlogs); // Очистить все блоги

export default router;




