import 'dotenv/config';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'bestuser_temp',
  password: process.env.DB_PASSWORD || '55555',
  database: process.env.DB_DATABASE || 'bestsite',
  synchronize: false,
  logging: true,
  entities: ["database/entities/**/*.js"],
  migrations: ["database/migrations/**/*.js"],
  subscribers: [],
  extra: {
    charset: "utf8",
    client_encoding: "utf8"
  }
});

// Замените export default на module.exports:
module.exports = AppDataSource;