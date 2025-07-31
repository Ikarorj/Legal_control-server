import { Request, Response } from 'express';
import { pool } from '../db';
import { encrypt, decrypt } from '../ults/cryptKMS';


export const getAllClients = async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM client');
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar clients' });
  }
};

export const createClient = async (req: Request, res: Response) => {
  const { name, cpf, email, phone, accessKey, createdBy } = req.body;
  try {
    const now = new Date();
    const { rows } = await pool.query(
      `INSERT INTO client (name, cpf, email, phone, accesskey, createdat, updatedat, createdby)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, cpf, email, phone, accessKey, now, now, createdBy || 1]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao cadastrar cliente' });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, cpf, email, phone, accessKey, updatedBy } = req.body;
  try {
    const now = new Date();
    const { rows } = await pool.query(
      `UPDATE client SET name=$1, cpf=$2, email=$3, phone=$4, accesskey=$5, updatedat=$6, updatedby=$7
       WHERE id=$8 RETURNING *`,
      [name, cpf, email, phone, accessKey, now, updatedBy || 1, id]
    );
    rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Cliente não encontrado' });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM client WHERE id = $1', [id]);
    res.json({ message: 'Cliente removido com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao remover cliente' });
  }
};
