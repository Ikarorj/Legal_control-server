import { Request, Response } from 'express';
import { pool } from '../db';

export const getAllSituacoesPrisionais = async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM situacaoprisional');
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar situações' });
  }
};
