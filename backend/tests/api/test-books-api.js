// Тестовый скрипт для проверки API книг
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3002/api';

async function testBooksAPI() {
  try {
    // Тест 1: Создание таблицы books
    const createTableResponse = await fetch(`${API_BASE}/books/init-table`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (createTableResponse.ok) {
      const result = await createTableResponse.json();
      } else {
      }
    
    // Тест 2: Получение списка книг
    const getBooksResponse = await fetch(`${API_BASE}/books`);
    
    if (getBooksResponse.ok) {
      const books = await getBooksResponse.json();
      books.forEach(book => {
        `);
      });
    } else {
      }
    
    } catch (error) {
    }
}

// Запускаем тест
testBooksAPI();

