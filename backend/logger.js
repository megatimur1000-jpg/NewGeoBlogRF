import { createLogger, format, transports } from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Абсолютный путь к logs
const logDir = path.resolve(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let base = `${timestamp} [${level.toUpperCase()}] ${message}`;
    if (stack) base += `\n${stack}`;
    if (Object.keys(meta).length) base += ` ${JSON.stringify(meta)}`;
    return base;
  })
);

const logger = createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error', maxsize: 2 * 1024 * 1024, maxFiles: 10 }),
    new transports.File({ filename: path.join(logDir, 'app.log'), maxsize: 5 * 1024 * 1024, maxFiles: 10 })
  ],
});

// В dev-режиме — цветная консоль
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

logger.info('Logger initialized!');

export default logger; 