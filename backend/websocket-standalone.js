import { WebSocketServer } from 'ws';
import { createServer } from 'http';
// SONAR-AUTO-FIX (javascript:S1128): original: // SONAR-AUTO-FIX (javascript:S1128): original: import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import databaseConfig from './database.config.simple.cjs';

const pool = new Pool(databaseConfig);

// Создаем HTTP сервер
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket Server Running');
});

// Создаем WebSocket сервер
const wss = new WebSocketServer({ server });

const clients = new Map(); // userId -> WebSocket
const rooms = new Map(); // roomId -> Set of userIds

wss.on('connection', (ws, req) => {
  // Для тестирования без токена
  const testUserId = 'test-user-123';
  clients.set(testUserId, ws);
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      // Эхо ответ
      ws.send(JSON.stringify({
        type: 'echo',
        original: message,
        timestamp: new Date().toISOString()
      }));
      
    } catch (error) {
      }
  });
  
  ws.on('close', () => {
    clients.delete(testUserId);
  });
  
  ws.on('error', (error) => {
    });
});

const PORT = 8080;
server.listen(PORT, () => {
  });

// Graceful shutdown
process.on('SIGINT', () => {
  wss.close();
  server.close();
  pool.end();
  process.exit(0);
});


