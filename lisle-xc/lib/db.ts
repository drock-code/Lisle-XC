import mysql from 'mysql2/promise';

const poolProvider = () => {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0,
    idleTimeout: 10000
  });
};

declare global {
  var globalPool: ReturnType<typeof poolProvider> | undefined;
}

// Reuse the pool if it exists on global, otherwise create a new one
export const pool = global.globalPool ?? poolProvider();

// In development, save the pool to the global object so it survives hot-reloads
if (process.env.NODE_ENV !== 'production') {
  global.globalPool = pool;
}