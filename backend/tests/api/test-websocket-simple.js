import WebSocket from 'ws';

async function testWebSocket() {
  try {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.on('open', function open() {
      // Отправляем тестовое сообщение
      const testMessage = {
        type: 'join',
        room: 'Еда',
        user_id: 1,
        username: 'Тестовый пользователь',
        avatar: 'default-avatar.svg'
      };
      
      ws.send(JSON.stringify(testMessage));
      
      // Отправляем сообщение в чат
      setTimeout(() => {
        const chatMessage = {
          type: 'message',
          room: 'Еда',
          message: 'Тестовое сообщение от скрипта'
        };
        
        ws.send(JSON.stringify(chatMessage));
      }, 1000);
    });
    
    ws.on('message', function message(data) {
      );
    });
    
    ws.on('error', function error(err) {
      });
    
    ws.on('close', function close() {
      });
    
    // Закрываем через 5 секунд
    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 5000);
    
  } catch (error) {
    }
}

testWebSocket();

