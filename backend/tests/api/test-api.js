import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3002';

async function testChatAPI() {
  try {
    // Тест 1: Проверяем базовый роут
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/test`);
      const data = await response.text();
      } catch (error) {
      }
    
    // Тест 2: Получаем комнаты
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/hashtag-rooms`);
      if (response.ok) {
        const rooms = await response.json();
        rooms.forEach(room => {
          });
      } else {
        }
    } catch (error) {
      }
    
    // Тест 3: Получаем сообщения для первой комнаты
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/hashtag-rooms`);
      if (response.ok) {
        const rooms = await response.json();
        if (rooms.length > 0) {
          const firstRoom = rooms[0];
          `);
          
          const messagesResponse = await fetch(`${API_BASE_URL}/api/chat/hashtag-rooms/${firstRoom.id}/messages`);
          if (messagesResponse.ok) {
            const messages = await messagesResponse.json();
            messages.slice(0, 3).forEach(msg => {
              }...`);
            });
          } else {
            }
        }
      }
    } catch (error) {
      }
    
  } catch (error) {
    }
}

testChatAPI();
