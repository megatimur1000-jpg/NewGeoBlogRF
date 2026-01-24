    import pg from 'pg';
    import dotenv from 'dotenv';

    dotenv.config(); // Загружаем переменные окружения из .env

    const pool = new pg.Pool({
      user: process.env.DB_USER || 'bestuser_temp',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_DATABASE || 'bestsite',
      password: process.env.DB_PASSWORD || '55555',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      // Правильные настройки кодировки для node-postgres
      client_encoding: 'utf8'
    });

    pool.on('error', (err) => {
      process.exit(-1); // Выходим из процесса, если есть фатальная ошибка БД
    });

    export default pool;