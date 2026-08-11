require('dotenv').config();
const sql = require('mssql/msnodesqlv8'); 

const config = {
  connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};Trusted_Connection=yes;`,
  options: { useUTC: true },
};

let pool = null;

const connect = async () => {
  try {
    pool = await sql.connect(config);
    console.log('Connected to SQL Server');
    return pool;
  } catch (err) {
    console.error('SQL Server connection failed:', err.message);
    throw err;
  }
};

const getPool = () => {
  if (!pool) throw new Error('Database not connected. Call connect() first.');
  return pool;
};

const close = async () => {
  if (pool) {
    await sql.close();
    pool = null;
    console.log('SQL Server connection closed');
  }
};

module.exports = { sql, connect, getPool, close };
