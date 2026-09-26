const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('[db] Conexao com o MySQL estabelecida com sucesso.');
    conn.release();
  } catch (err) {
    console.error('[db] Falha ao conectar no MySQL:', err.message);
  }
}

module.exports = { pool, testConnection };
