import { Request, Response } from 'express';
import { pool } from '../db';

export const getAllProcessUpdates = async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM processupdate');
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar atualizações' });
  }
};

export const createProcessUpdate = async (req: Request, res: Response) => {
  const { processId, date, description, author } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO processupdate (processid, date, description, author) VALUES ($1,$2,$3,$4) RETURNING *`,
      [processId, date, description, author]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao cadastrar atualização' });
  }
};

export const updateProcessUpdate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, description, author } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE processupdate SET date=$1, description=$2, author=$3 WHERE id=$4 RETURNING *`,
      [date, description, author, id]
    );
    rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Atualização não encontrada' });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar atualização' });
  }
};

export const deleteProcessUpdate = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM processupdate WHERE id = $1', [id]);
    res.json({ message: 'Atualização removida com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao remover atualização' });
  }
};
