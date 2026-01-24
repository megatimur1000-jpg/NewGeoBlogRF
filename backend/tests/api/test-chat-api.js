import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3002/api/chat';

async function testChatAPI() {
  try {
    // 1. Создаем тестовый чат
    const createChatResponse = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Тестовый чат',
        description: 'Чат для тестирования API',
        type: 'public',
        creatorId: 1,
        isPrivate: false,
        maxParticipants: 50
      })
    });

    if (createChatResponse.ok) {
      const chat = await createChatResponse.json();
      const roomId = chat.id;

      // 2. Добавляем участника
      const addParticipantResponse = await fetch(`${API_BASE}/rooms/${roomId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: roomId,
          userId: 2,
          role: 'member'
        })
      });

      if (addParticipantResponse.ok) {
        const participant = await addParticipantResponse.json();
        } else {
        );
      }

      // 3. Отправляем сообщение
      const sendMessageResponse = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
      headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: roomId,
          senderId: 1,
          content: 'Привет! Это тестовое сообщение.',
          messageType: 'text'
        })
      });

      if (sendMessageResponse.ok) {
        const message = await sendMessageResponse.json();
        } else {
        );
      }

      // 4. Получаем сообщения чата
      const getMessagesResponse = await fetch(`${API_BASE}/rooms/${roomId}/messages`);
      
      if (getMessagesResponse.ok) {
        const messages = await getMessagesResponse.json();
        } else {
        );
      }

      // 5. Получаем участников чата
      const getParticipantsResponse = await fetch(`${API_BASE}/rooms/${roomId}/participants`);
      
      if (getParticipantsResponse.ok) {
        const participants = await getParticipantsResponse.json();
        } else {
        );
      }

    } else {
      );
    }

  } catch (error) {
    }
}

testChatAPI(); 