import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL do Render, por exemplo
  ssl: { rejectUnauthorized: false }
});
(async () => {
  const res = await pool.query('SHOW client_encoding');
  console.log('ENCODING ATUAL DA CONEXÃO =>', res.rows[0].client_encoding);
})();
