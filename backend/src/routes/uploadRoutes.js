import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { upload, uploadImage, deleteImage } from '../controllers/uploadController.js';

const router = express.Router();

// POST /api/upload/image - Загрузка изображения
router.post('/upload/image', authenticateToken, upload.single('image'), uploadImage);

// DELETE /api/upload/image/:filename - Удаление изображения
router.delete('/upload/image/:filename', authenticateToken, deleteImage);

export default router;

