const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'bestuser_temp',
    password: '55555',
    database: 'bestsite'
});

async function auditDatabase() {
    try {
        await client.connect();
        // Получаем список всех таблиц
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        );

        for (const tableRow of tablesResult.rows) {
            const tableName = tableRow.table_name;
            // Получаем структуру таблицы
            const columnsResult = await client.query(`
                SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
                FROM information_schema.columns 
                WHERE table_name = $1 
                ORDER BY ordinal_position
            `, [tableName]);
            
            columnsResult.rows.forEach(col => {
                const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(not null)';
                const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
                const defaultValue = col.column_default ? ` default: ${col.column_default}` : '';
                });

            // Получаем количество записей
            const countResult = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            }

        // Проверяем соответствие с кодом
        );

        // Проверяем таблицу users
        const usersColumns = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'users' ORDER BY ordinal_position
        `);
        const usersFields = usersColumns.rows.map(row => row.column_name);
        );
        
        // Поля, используемые в коде (из анализа)
        const codeUsersFields = ['id', 'email', 'username', 'password_hash', 'role', 'created_at', 'updated_at'];
        );
        
        const missingInDB = codeUsersFields.filter(field => !usersFields.includes(field));
        const missingInCode = usersFields.filter(field => !codeUsersFields.includes(field));
        
        if (missingInDB.length > 0) {
            );
        }
        if (missingInCode.length > 0) {
            );
        }
        if (missingInDB.length === 0 && missingInCode.length === 0) {
            }

        // Проверяем таблицу map_markers
        const markersColumns = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'map_markers' ORDER BY ordinal_position
        `);
        const markersFields = markersColumns.rows.map(row => row.column_name);
        );
        
        // Поля, используемые в коде (из анализа)
        const codeMarkersFields = [
            'id', 'creator_id', 'title', 'description', 'latitude', 'longitude', 
            'address', 'category', 'subcategory', 'photo_urls', 'hashtags', 
            'visibility', 'author_name', 'created_at', 'updated_at', 'rating', 
            'rating_count', 'is_verified', 'likes_count', 'comments_count', 'shares_count'
        ];
        );
        
        const missingMarkersInDB = codeMarkersFields.filter(field => !markersFields.includes(field));
        const missingMarkersInCode = markersFields.filter(field => !codeMarkersFields.includes(field));
        
        if (missingMarkersInDB.length > 0) {
            );
        }
        if (missingMarkersInCode.length > 0) {
            );
        }
        if (missingMarkersInDB.length === 0 && missingMarkersInCode.length === 0) {
            }

        // Проверяем таблицу events
        const eventsColumns = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'events' ORDER BY ordinal_position
        `);
        const eventsFields = eventsColumns.rows.map(row => row.column_name);
        );
        
        // Поля, используемые в коде (из анализа)
        const codeEventsFields = [
            'id', 'creator_id', 'title', 'description', 'event_type', 'start_datetime', 
            'end_datetime', 'location', 'category', 'max_participants', 'is_public', 
            'photo_urls', 'hashtags', 'author_name', 'created_at', 'updated_at', 
            'participants_count', 'likes_count', 'comments_count'
        ];
        );
        
        const missingEventsInDB = codeEventsFields.filter(field => !eventsFields.includes(field));
        const missingEventsInCode = eventsFields.filter(field => !codeEventsFields.includes(field));
        
        if (missingEventsInDB.length > 0) {
            );
        }
        if (missingEventsInCode.length > 0) {
            );
        }
        if (missingEventsInDB.length === 0 && missingEventsInCode.length === 0) {
            }

        // Проверяем внешние ключи
        const foreignKeys = await client.query(`
            SELECT 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
            ORDER BY tc.table_name, kcu.column_name
        `);
        
        if (foreignKeys.rows.length > 0) {
            foreignKeys.rows.forEach(fk => {
                });
        } else {
            }

        // Проверяем индексы
        const indexes = await client.query(`
            SELECT 
                schemaname,
                tablename,
                indexname,
                indexdef
            FROM pg_indexes 
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname
        `);
        
        if (indexes.rows.length > 0) {
            indexes.rows.forEach(idx => {
                });
        } else {
            }

    } catch (error) {
        } finally {
        await client.end();
    }
}

auditDatabase(); 