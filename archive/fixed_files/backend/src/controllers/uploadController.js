import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
// SONAR-AUTO-FIX (javascript:S1128): original: // SONAR-AUTO-FIX (javascript:S1128): original: // SONAR-AUTO-FIX (javascript:S1128): original: import pool from '../../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем директорию для загрузок, если её нет
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка multer для сохранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Фильтр для проверки типа файла
const fileFilter = (req, file, cb) => {
  // Разрешаем только изображения
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Разрешена загрузка только изображений'), false);
  }
};

// Настройка multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

// Контроллер загрузки изображения
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Файл не был загружен' 
      });
    }

    // Формируем URL для доступа к файлу
    const fileUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

    // Сохраняем информацию о загруженном файле в БД (опционально)
    // Можно создать таблицу uploaded_files для отслеживания загрузок

    res.json({
      message: 'Изображение успешно загружено',
      photoUrl: fullUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера при загрузке изображения',
      error: error.message 
    });
  }
};

// Контроллер удаления изображения (опционально)
export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Изображение успешно удалено' });
    } else {
      res.status(404).json({ message: 'Файл не найден' });
    }
  } catch (error) {
    console.error('Ошибка удаления изображения:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера при удалении изображения' 
    });
  }
};




