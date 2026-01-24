const axios = require('axios');

async function testSimpleQuery() {
  try {
    // Максимально простой запрос
    const query = `
      [out:json][timeout:25];
      node["tourism"="attraction"](56.0784,40.3284,56.1784,40.4484);
      out meta;
    `;
    
    const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
      timeout: 30000,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
    
    if (response.data.elements && response.data.elements.length > 0) {
      response.data.elements.forEach((element, i) => {
        });
    }
    
  } catch (error) {
    if (error.response) {
      }
  }
}

testSimpleQuery();

async function testSimpleQuery() {
  try {
    // Максимально простой запрос
    const query = `
      [out:json][timeout:25];
      node["tourism"="attraction"](56.0784,40.3284,56.1784,40.4484);
      out meta;
    `;
    
    const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
      timeout: 30000,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
    
    if (response.data.elements && response.data.elements.length > 0) {
      response.data.elements.forEach((element, i) => {
        });
    }
    
  } catch (error) {
    if (error.response) {
      }
  }
}

testSimpleQuery();

