import { Request, Response } from 'express';
import { pool } from '../db';

export const getAllTiposCrime = async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tipocrime');
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar tipos de crime' });
  }
};

export const createTipoCrime = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO tipocrime (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao adicionar tipo de crime' });
  }
};

export const updateTipoCrime = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE tipocrime SET name=$1 WHERE id=$2 RETURNING *',
      [name, id]
    );
    rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Tipo de crime não encontrado' });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar tipo de crime' });
  }
};

export const deleteTipoCrime = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tipocrime WHERE id=$1', [id]);
    res.json({ message: 'Tipo de crime removido com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao remover tipo de crime' });
  }
};
