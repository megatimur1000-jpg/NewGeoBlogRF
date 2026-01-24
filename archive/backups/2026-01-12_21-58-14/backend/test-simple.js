import fetch from 'node-fetch';

async function testSimple() {
  try {
    // Тест 1: Проверяем что сервер отвечает
    const response = await fetch('http://localhost:3002/api/test');
    const data = await response.text();
    // Тест 2: Создаем чат с валидным UUID
    const chatData = {
      name: "Тестовый чат",
      description: "Тест API",
      type: "group",
      creatorId: "123e4567-e89b-12d3-a456-426614174000",
      isPrivate: false,
      maxParticipants: 10
    };
    
    const chatResponse = await fetch('http://localhost:3002/api/chat/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chatData)
    });
    
    if (chatResponse.ok) {
      const chatResult = await chatResponse.json();
      } else {
      const errorData = await chatResponse.json();
      }
    
  } catch (error) {
    }
}

testSimple();

