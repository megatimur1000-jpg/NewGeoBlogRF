const axios = require('axios');

async function testOverpassAPI() {
  try {
    // Простой тестовый запрос для Владимира
    const query = `
      [out:json][timeout:25];
      (
        node["tourism"="attraction"](56.0784,40.3284,56.1784,40.4484);
      );
      out meta;
    `;
    
    const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
      timeout: 30000,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
    
    if (response.data.elements && response.data.elements.length > 0) {
      response.data.elements.slice(0, 3).forEach((element, i) => {
        console.log(`Элемент ${i + 1}:`, element);
      });
    }
    
  } catch (error) {
    if (error.response) {
      console.error('Ошибка API:', error.response.data);
    } else {
      console.error('Ошибка:', error.message);
    }
  }
}

testOverpassAPI();

async function testOverpassAPI() {
  try {
    // Простой тестовый запрос для Владимира
    const query = `
[out:json][timeout:25];
(
  node["tourism"="attraction"](56.0784,40.3284,56.1784,40.4484);
);
out meta;
`;
    const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
      timeout: 30000,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
    
    if (response.data.elements && response.data.elements.length > 0) {
      response.data.elements.slice(0, 3).forEach((element, i) => {
        console.log(`Элемент ${i + 1}:`, element);
      });
    }
    
  } catch (error) {
    if (error.response) {
      console.error('Ошибка API:', error.response.data);
    } else {
      console.error('Ошибка:', error.message);
    }
  }
}

testOverpassAPI();
