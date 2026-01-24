import pool from './src/database/config.js';

async function checkBlogs() {
  try {
    const result = await pool.query(`
      SELECT id, title, author_id, status, created_at 
      FROM blog_posts 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    result.rows.forEach(blog => {
      });
    
    await pool.end();
  } catch (error) {
    await pool.end();
  }
}

checkBlogs();

