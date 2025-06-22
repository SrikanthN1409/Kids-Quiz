// import pkg from 'pg';
// import 'dotenv/config.js';
// const { Pool } = pkg;

// export const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false }   // Render’s Postgres
// });
import 'dotenv/config.js';
import pkg from 'pg';
const { Pool } = pkg;

console.log('🔐 DATABASE_URL =', process.env.DATABASE_URL); // Check if it loads

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // 👈 required for Render or Railway hosted DBs
});

