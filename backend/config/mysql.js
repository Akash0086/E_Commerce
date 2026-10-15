import mysql from 'mysql2/promise';
//import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
//dotenv.config();


/*console.log('Connecting to MySQL with:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD 
});
*/

export const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const sqldb = async () => {
  try {
    const connection = await db.getConnection();
    console.log("MySQL successfully connected");
    connection.release();
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    process.exit(1);
  }
};