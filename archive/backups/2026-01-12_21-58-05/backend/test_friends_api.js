import fetch from 'node-fetch';

async function testFriendsAPI() {
  const baseUrl = 'http://localhost:3002';
  
  // Тест 1: Проверка доступности сервера
  try {
    const response = await fetch(`${baseUrl}/`);
    } catch (error) {
    return;
  }
  
  // Получаем список пользователей для получения реального UUID
  let testUserId = null;
  try {
    const usersResponse = await fetch(`${baseUrl}/api/users`);
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      if (users.length > 0) {
        testUserId = users[0].id;
        }
    }
  } catch (error) {
    return;
  }
  
  if (!testUserId) {
    return;
  }
  
  // Тест 2: Проверка поиска пользователей
  try {
    const response = await fetch(`${baseUrl}/api/friends/search?userId=${testUserId}&query=test`);
    if (response.ok) {
      const data = await response.json();
      } else {
      const errorText = await response.text();
      }
  } catch (error) {
    }
  
  // Тест 3: Проверка списка друзей
  try {
    const response = await fetch(`${baseUrl}/api/friends?userId=${testUserId}`);
    if (response.ok) {
      const data = await response.json();
      } else {
      const errorText = await response.text();
      }
  } catch (error) {
    }
}

testFriendsAPI();
