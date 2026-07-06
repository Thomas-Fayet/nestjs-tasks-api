import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: `.env.${process.env.NODE_ENV}` });
config();

const isCompiled = __filename.endsWith('.js');

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    join(__dirname, isCompiled ? '../**/*.entity.js' : '../**/*.entity.ts'),
  ],
  migrations: [
    join(__dirname, isCompiled ? 'migrations/*.js' : 'migrations/*.ts'),
  ],
});
