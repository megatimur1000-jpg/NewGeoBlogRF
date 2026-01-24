const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'bestuser_temp',
    password: '55555',
    database: 'bestsite'
});

async function checkDatabase() {
    try {
        await client.connect();
        // Проверяем миграции
        const migrationsResult = await client.query('SELECT * FROM migrations ORDER BY id DESC');
        migrationsResult.rows.forEach(row => {
            `);
        });

        // Проверяем структуру таблицы map_markers
        const tableInfo = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'map_markers' 
            ORDER BY ordinal_position
        `);
        
        tableInfo.rows.forEach(row => {
            ' : '(not null)'} ${row.column_default ? `default: ${row.column_default}` : ''}`);
        });

        // Проверяем количество записей
        const countResult = await client.query('SELECT COUNT(*) as count FROM map_markers');
        } catch (error) {
        } finally {
        await client.end();
    }
}

checkDatabase();
