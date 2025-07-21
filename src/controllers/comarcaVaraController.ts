import { Request, Response } from 'express';
import { pool } from '../db';

export const getAllComarcasVaras = async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM comarcavara');
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar comarcas/varas' });
  }
};

export const createComarcaVara = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO comarcavara (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao adicionar comarca/vara' });
  }
};

export const updateComarcaVara = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE comarcavara SET name=$1 WHERE id=$2 RETURNING *',
      [name, id]
    );
    rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Comarca/vara não encontrada' });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar comarca/vara' });
  }
};

export const deleteComarcaVara = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM comarcavara WHERE id=$1', [id]);
    res.json({ message: 'Comarca/vara removida com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao remover comarca/vara' });
  }
};

