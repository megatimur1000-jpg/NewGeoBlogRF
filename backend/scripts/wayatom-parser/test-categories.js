const axios = require('axios');

async function testCategories() {
  try {
    const categories = require('./config/categories');
    const bounds = [56.0784, 40.3284, 56.1784, 40.4484]; // Владимир
    const bbox = `${bounds[0]},${bounds[1]},${bounds[2]},${bounds[3]}`;
    
    for (const [key, category] of Object.entries(categories)) {
      const query = category.overpass_query.replace('{{bbox}}', bbox);
      
      try {
        const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
          timeout: 30000,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8'
          }
        });
        
        const elements = response.data.elements || [];
        if (elements.length > 0) {
          elements.slice(0, 3).forEach((element, i) => {
            .join(', ')})`);
          });
        }
        
      } catch (error) {
        if (error.response) {
          }
      }
      
      // Задержка между запросами
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    }
}

testCategories();

async function testCategories() {
  try {
    const categories = require('./config/categories');
    const bounds = [56.0784, 40.3284, 56.1784, 40.4484]; // Владимир
    const bbox = `${bounds[0]},${bounds[1]},${bounds[2]},${bounds[3]}`;
    
    for (const [key, category] of Object.entries(categories)) {
      const query = category.overpass_query.replace('{{bbox}}', bbox);
      
      try {
        const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
          timeout: 30000,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8'
          }
        });
        
        const elements = response.data.elements || [];
        if (elements.length > 0) {
          elements.slice(0, 3).forEach((element, i) => {
            .join(', ')})`);
          });
        }
        
      } catch (error) {
        if (error.response) {
          }
      }
      
      // Задержка между запросами
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    }
}

testCategories();

