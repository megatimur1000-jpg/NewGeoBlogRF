const axios = require('axios');

async function testAttractions() {
  try {
    const queries = [
      {
        name: 'tourism=attraction',
        query: `[out:json][timeout:25];
node["tourism"="attraction"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'historic',
        query: `[out:json][timeout:25];
node["historic"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'amenity=place_of_worship',
        query: `[out:json][timeout:25];
node["amenity"="place_of_worship"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'tourism=museum',
        query: `[out:json][timeout:25];
node["tourism"="museum"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'tourism=monument',
        query: `[out:json][timeout:25];
node["tourism"="monument"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'leisure=park',
        query: `[out:json][timeout:25];
node["leisure"="park"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      }
    ];
    
    for (const category of queries) {
      try {
        const response = await axios.post('https://overpass-api.de/api/interpreter', category.query, {
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
        }
      
      // Задержка между запросами
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    }
}

testAttractions();

async function testAttractions() {
  try {
    const queries = [
      {
        name: 'tourism=attraction',
        query: `[out:json][timeout:25];
node["tourism"="attraction"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'historic',
        query: `[out:json][timeout:25];
node["historic"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'amenity=place_of_worship',
        query: `[out:json][timeout:25];
node["amenity"="place_of_worship"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'tourism=museum',
        query: `[out:json][timeout:25];
node["tourism"="museum"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'tourism=monument',
        query: `[out:json][timeout:25];
node["tourism"="monument"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      },
      {
        name: 'leisure=park',
        query: `[out:json][timeout:25];
node["leisure"="park"](56.0784,40.3284,56.1784,40.4484);
out meta;`
      }
    ];
    
    for (const category of queries) {
      try {
        const response = await axios.post('https://overpass-api.de/api/interpreter', category.query, {
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
        }
      
      // Задержка между запросами
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    }
}

testAttractions();

