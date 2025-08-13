// lib/db.ts
import { Pool } from 'pg';

export const pool = new Pool({
  host: '34.27.196.244',
  user: 'postgres',
  password: 'My8572839479#',
  database: 'postgres',
  port: 5432,

  // Add this SSL configuration
  ssl: {
    rejectUnauthorized: false,
  },
});