import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased from 2000 to 10000 (10 seconds)
  acquireTimeoutMillis: 10000, // Time to wait for a connection from the pool
  createTimeoutMillis: 10000, // Time to wait for connection creation
});
console.log('db config', {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
// Test connection on startup
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit immediately, let the application handle it
});

// Test initial connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection test successful');
    client.release();
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.log('\n🔧 DATABASE CONNECTION TROUBLESHOOTING');
    console.log('─'.repeat(50));
    console.log('1. Check if the database server is running');
    console.log('2. Verify network connectivity to:', process.env.DB_HOST || 'localhost');
    console.log('3. Check firewall settings');
    console.log('4. Verify database credentials');
    console.log('5. Check if the database exists:', process.env.DB_NAME || 'postgres');
    console.log('\nCurrent connection config:');
    console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`  Port: ${process.env.DB_PORT || 5432}`);
    console.log(`  Database: ${process.env.DB_NAME || 'postgres'}`);
    console.log(`  User: ${process.env.DB_USER || 'postgres'}`);
    throw error;
  }
}

// Test connection on startup
testConnection().catch(() => {
  console.log('Database connection failed, but continuing...');
});

/**
 * Query the database
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<object>} Query result
 */
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<object>} Database client
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}

/**
 * Close the database pool
 */
export async function closePool() {
  await pool.end();
  console.log('Database pool closed');
}

export default {
  query,
  getClient,
  closePool,
  pool,
};

