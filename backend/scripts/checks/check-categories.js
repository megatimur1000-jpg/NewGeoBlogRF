import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'bestsite',
  user: 'bestuser_temp',
  password: '55555',
});

async function checkCategories() {
  try {
    const result = await pool.query('SELECT unnest(enum_range(NULL::marker_category)) as category_value');
    result.rows.forEach(row => );
  } catch (error) {
    } finally {
    await pool.end();
  }
}

checkCategories();

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'bestsite',
  user: 'bestuser_temp',
  password: '55555',
});

async function checkCategories() {
  try {
    const result = await pool.query('SELECT unnest(enum_range(NULL::marker_category)) as category_value');
    result.rows.forEach(row => );
  } catch (error) {
    } finally {
    await pool.end();
  }
}

checkCategories();

