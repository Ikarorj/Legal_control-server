import { Request, Response } from 'express';
import { pool } from '../db';

export const getAllProcesses = async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, c.name AS client_name, sp.name AS situacao_prisional, cv.name AS comarca_vara,
             tc.name AS tipo_crime,
             COALESCE(json_agg(json_build_object('id', pu.id, 'description', pu.description, 'author', pu.author, 'date', pu.date)) FILTER (WHERE pu.id IS NOT NULL), '[]') AS updates
      FROM process p
      LEFT JOIN client c ON c.id = p.clientid
      LEFT JOIN situacaoprisional sp ON sp.id = p.situacaoprisionalid
      LEFT JOIN comarcavara cv ON cv.id = p.comarcavaraid
      LEFT JOIN tipocrime tc ON tc.id = p.tipocrimeid
      LEFT JOIN processupdate pu ON pu.processid = p.id
      GROUP BY p.id, c.name, sp.name, cv.name, tc.name
      ORDER BY p.id;`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar processos' });
  }
};

export const createProcess = async (req: Request, res: Response) => {
  const {
    clientId, processNumber, title, status,
    startdate, description, lawyer,
    situacaoPrisionalId, comarcaVaraId, tipoCrimeId
  } = req.body;

  try {
    const now = new Date();
    const startDateValue = startdate ? new Date(startdate) : now;

    const { rows: [{ id: processId }] } = await pool.query(
      `INSERT INTO process (clientid, processnumber, title, status, startdate, lastupdate, description, lawyer, situacaoprisionalid, comarcavaraid, tipocrimeid)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [clientId, processNumber, title, status, startDateValue, now, description, lawyer, situacaoPrisionalId, comarcaVaraId, tipoCrimeId]
    );

    const { rows } = await pool.query(`
      SELECT p.*, c.name AS client_name, sp.name AS situacao_prisional, cv.name AS comarca_vara, tc.name AS tipo_crime, '[]'::json AS updates
      FROM process p
      LEFT JOIN client c ON c.id = p.clientid
      LEFT JOIN situacaoprisional sp ON sp.id = p.situacaoprisionalid
      LEFT JOIN comarcavara cv ON cv.id = p.comarcavaraid
      LEFT JOIN tipocrime tc ON tc.id = p.tipocrimeid
      WHERE p.id = $1 GROUP BY p.id, c.name, sp.name, cv.name, tc.name`,
      [processId]
    );

    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao cadastrar processo' });
  }
};

export const updateProcess = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    clientId, processNumber, title, status,
    startDate, description, lawyer,
    situacaoPrisionalId, comarcaVaraId, tipoCrimeId
  } = req.body;
  try {
    const now = new Date();
    const { rows } = await pool.query(
      `UPDATE process SET clientid=$1, processnumber=$2, title=$3, status=$4, startdate=$5, lastupdate=$6, description=$7, lawyer=$8, situacaoprisionalid=$9, comarcavaraid=$10, tipocrimeid=$11
       WHERE id=$12 RETURNING *`,
      [clientId, processNumber, title, status, startDate, now, description, lawyer, situacaoPrisionalId, comarcaVaraId, tipoCrimeId, id]
    );
    rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Processo não encontrado' });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar processo' });
  }
};

export const deleteProcess = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM process WHERE id = $1', [id]);
    res.json({ message: 'Processo removido com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao remover processo' });
  }
};
