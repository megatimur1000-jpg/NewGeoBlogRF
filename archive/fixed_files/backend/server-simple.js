import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// SONAR-AUTO-FIX (javascript:S1128): original: // SONAR-AUTO-FIX (javascript:S1128): original: // SONAR-AUTO-FIX (javascript:S1128): original: import pool from './db.js';
import { fileURLToPath } from 'url';
import path from 'path';
// SONAR-AUTO-FIX (javascript:S1128): original: // SONAR-AUTO-FIX (javascript:S1128): original: // SONAR-AUTO-FIX (javascript:S1128): original: import multer from 'multer';
// SONAR-AUTO-FIX (javascript:S1128): original: // SONAR-AUTO-FIX (javascript:S1128): original: // SONAR-AUTO-FIX (javascript:S1128): original: import fs from 'fs';
import { createServer } from 'http';

// Импорт маршрутов
import userRoutes from './src/routes/userRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import markerRoutes from './src/routes/marker.js';
import logger from './logger.js';
import routesRouter from './src/routes/routes.js';
// SONAR-AUTO-FIX (javascript:S1128): original: // SONAR-AUTO-FIX (javascript:S1128): original: // SONAR-AUTO-FIX (javascript:S1128): original: import HashtagChatServer from './hashtag-chat-server-integrated.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.SERVER_PORT || 3002;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Логирование
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Статические файлы
app.use(express.static('public'));

// Тестовый маршрут
app.get('/', (req, res) => {
  res.send('Бэкенд WayAtom запущен!');
});

// API маршруты
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', markerRoutes);
app.use('/api', routesRouter);

// Простая функция запуска сервера
async function startServer() {
  try {
    // Запускаем HTTP сервер
    server.listen(PORT, () => {
      console.log(`✅ Сервер запущен на порту ${PORT}`);
      console.log(`✅ API доступно по адресу http://localhost:${PORT}/api`);
      // Интегрируем WebSocket сервер
      try {
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:         const chatWSS = new HashtagChatServer(server);
        console.log('✅ WebSocket сервер интегрирован');
        } catch (error) {
        console.error('❌ Ошибка инициализации WebSocket:', error);
        }
    });
    
  } catch (error) {
    process.exit(1);
  }
}

// Запускаем сервер
startServer();





