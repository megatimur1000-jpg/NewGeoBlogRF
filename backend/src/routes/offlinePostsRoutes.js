import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { authenticateToken } from '../middleware/auth.js';
import {
  createOfflinePost,
  uploadPostImages,
  uploadPostTrack,
  getPostStatus
} from '../controllers/offlinePostsController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к временной папке для multer
const TEMP_UPLOAD_DIR = path.join(__dirname, '../../../uploads/temp');
if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
  fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
}

// Настройка multer для загрузки изображений офлайн постов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = randomUUID();
    const ext = path.extname(file.originalname) || (file.mimetype === 'image/jpeg' ? '.jpg' : '.png');
    cb(null, `offline-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Разрешаем только JPEG и PNG
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения формата JPEG и PNG'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 МБ на файл
    files: 10 // Максимум 10 файлов
  },
  fileFilter: fileFilter
});

// POST /api/offline-posts - Создать заглушку поста
router.post('/offline-posts', authenticateToken, createOfflinePost);

// POST /api/posts/:id/images - Загрузить изображения
router.post('/posts/:id/images', authenticateToken, upload.array('images', 10), uploadPostImages);

// PUT /api/posts/:id/track - Загрузить трек
router.put('/posts/:id/track', authenticateToken, uploadPostTrack);

// GET /api/posts/:id/status - Получить статус поста
router.get('/posts/:id/status', authenticateToken, getPostStatus);

export default router;

