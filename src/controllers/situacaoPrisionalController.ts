import { Request, Response } from 'express';
import { pool } from '../db';

export const getAllSituacoesPrisionais = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM situacaoprisional');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar situações prisionais:', error);
    res.status(500).json({ error: 'Erro ao buscar situações prisionais' });
  }
};

export const createSituacaoPrisional = async (req: Request, res: Response) => {
 const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO situacaoprisional (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar situação prisional:', error);
    res.status(500).json({ error: 'Erro ao adicionar situação prisional' });
  }
};
export const updateSituacaoPrisional = async (req: Request, res: Response) => {
   const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE situacaoprisional SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Situação prisional não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar situação prisional:', error);
    res.status(500).json({ error: 'Erro ao atualizar situação prisional' });
  }
};
export const deleteSituacaoPrisional = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM situacaoprisional WHERE id = $1', [id]);
    res.json({ message: 'Situação prisional removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover situação prisional:', error);
    res.status(500).json({ error: 'Erro ao remover situação prisional' });
  }
};




/* Situações Prisionais
router.get('/situacoesPrisionais', async (req, res) => {
 
});

router.post('/situacoesPrisionais', async (req, res) => {
 
});
router.put('/situacoesPrisionais/:id', async (req, res) => {
 
});
router.delete('/situacoesPrisionais/:id', async (req, res) => {
 
});
*/