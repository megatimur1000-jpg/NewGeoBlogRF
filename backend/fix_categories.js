const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'bestuser_temp',
  password: '55555',
  database: 'bestsite',
});

async function fixCategories() {
  const client = await pool.connect();
  
  try {
    // Check current enum values
    const result = await client.query(`
      SELECT unnest(enum_range(NULL::marker_category)) as category;
    `);
    );
    
    // Add missing categories one by one
    const missingCategories = [
      'hidden_gems', 'instagram', 'non_tourist', 'summer2024', 'winter2024', 
      'newyear', 'family', 'romantic', 'budget', 'trekking', 'gastrotour', 
      'ecotourism', 'excursions', 'user_poi', 'blog', 'event'
    ];
    
    for (const category of missingCategories) {
      try {
        await client.query(`ALTER TYPE marker_category ADD VALUE '${category}';`);
        } catch (error) {
        if (error.code === '42710') {
          } else {
          }
      }
    }
    
    } catch (error) {
    } finally {
    client.release();
    await pool.end();
  }
}

fixCategories();
