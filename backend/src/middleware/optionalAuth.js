import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import logger from '../../logger.js';

// Опциональная авторизация - не блокирует запрос, если токена нет
export const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    req.user = null; // Устанавливаем user в null для гостей
    return next();
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    // Если токен невалидный (истёк, повреждён, подделан), игнорируем его
    logger.warn(`⚠️ Невалидный токен в запросе ${req.method} ${req.path}, обрабатываем как гостя`);
    req.user = null; // Если токен невалидный, разрешаем продолжить как гостю
    return next();
  }
  
  // Дополнительная проверка: убеждаемся, что токен не истёк
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
    logger.warn(`⚠️ Истёкший токен в запросе ${req.method} ${req.path}, обрабатываем как гостя`);
    req.user = null;
    return next();
  }

  // Токен валидный, устанавливаем пользователя
  req.user = decoded;
  next();
};

