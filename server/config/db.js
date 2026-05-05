import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const poolConfig = process.env.MYSQL_URL 
  ? process.env.MYSQL_URL 
  : {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'yourpassword',
      database: process.env.DB_NAME || 'taskmanager',
      port: parseInt(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

const pool = mysql.createPool(poolConfig);

export default pool;
