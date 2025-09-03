export const DATABASE_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'pi5_supernode',
  username: process.env.DB_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  ssl: process.env.NODE_ENV === 'production',
  pool: {
    min: 2,
    max: 10,
    idle: 10000
  }
};

export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0
};