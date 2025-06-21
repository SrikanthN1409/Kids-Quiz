import pkg from 'pg';
import 'dotenv/config.js';
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }   // Render’s Postgres
});
