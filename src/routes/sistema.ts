
// Ajustes completos para que o servidor use os nomes corretos das tabelas e campos

import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// Usuário logado (simulação)
router.get('/currentUser', (req, res) => {
  res.json({ id: 1, name: 'Usuário Teste' });
});

// Usuários
router.get('/user', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "user"');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

router.post('/user/login', async (req, res) => {
  const { email, password } = req.body; 
  try {
    const result = await pool.query(
      'SELECT * FROM "user" WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Clientes
router.get('/clients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM client');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar clients:', error);
    res.status(500).json({ error: 'Erro ao buscar clients' });
  }
});

router.post('/clients', async (req, res) => {
  console.log('🟨 Dados completos recebidos no body:', req.body);

  const { name, cpf, email, phone, accessKey, createdBy } = req.body;

  try {
    const now = new Date();

    const result = await pool.query(
      `INSERT INTO client (name, cpf, email, phone, accesskey, createdat, updatedat, createdby)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, cpf, email, phone, accessKey, now, now, createdBy || 1]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error);
    res.status(500).json({ error: 'Erro ao cadastrar cliente' });
  }
});

// Atualiza cliente
router.put('/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { name, cpf, email, phone, accessKey, updatedBy } = req.body;

  try {
    const now = new Date();
    const result = await pool.query(
      `UPDATE client SET
        name = $1,
        cpf = $2,
        email = $3,
        phone = $4,
        accesskey = $5,
        updatedat = $6,
        updatedby = $7
      WHERE id = $8 RETURNING *`,
      [name, cpf, email, phone, accessKey, now, updatedBy || 1, id]
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Cliente não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});
   
// Remove cliente
router.delete('/clients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM client WHERE id = $1`, [id]);
    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover cliente:', error);
    res.status(500).json({ error: 'Erro ao remover cliente' });
  }
});

// Process Updates
router.get('/processUpdate', async (req, res) => {
  try { 
    const result = await pool.query('SELECT * FROM processupdate');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar atualizações de processos:', error);
    res.status(500).json({ error: 'Erro ao buscar atualizações de processos' });
  }
});

router.post('/processUpdate', async (req, res) => {
  const { processId, date, description, author } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO processupdate (processid, date, description, author)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [processId, date, description, author]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar atualização de processo:', error);
    res.status(500).json({ error: 'Erro ao adicionar atualização de processo' });
  }
});

router.put('/processUpdate/:id', async (req, res) => {
  const { id } = req.params;
  const { date, description, author } = req.body;

  try {
    const result = await pool.query(
      `UPDATE processupdate SET
        date = $1,
        description = $2,
        author = $3
      WHERE id = $4 RETURNING *`,
      [date, description, author, id]
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Atualização não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar processo update:', error);
    res.status(500).json({ error: 'Erro ao atualizar processo update' });
  }
});

router.delete('/processUpdate/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM processupdate WHERE id = $1`, [id]);
    res.json({ message: 'Atualização removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover atualização:', error);
    res.status(500).json({ error: 'Erro ao remover atualização' });
  }
});

// Processos
router.get('/processes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,
        c.name AS client_name,
        sp.name AS situacao_prisional,
        cv.name AS comarca_vara,
        tc.name AS tipo_crime,
        COALESCE(json_agg(
          json_build_object(
            'id', pu.id,
            'description', pu.description,
            'author', pu.author,
            'date', pu.date
          )
        ) FILTER (WHERE pu.id IS NOT NULL), '[]') AS updates
      FROM process p
      LEFT JOIN client c ON c.id = p.clientid
      LEFT JOIN situacaoprisional sp ON sp.id = p.situacaoprisionalid
      LEFT JOIN comarcavara cv ON cv.id = p.comarcavaraid
      LEFT JOIN tipocrime tc ON tc.id = p.tipocrimeid
      LEFT JOIN processupdate pu ON pu.processid = p.id
      GROUP BY p.id, c.name, sp.name, cv.name, tc.name
      ORDER BY p.id;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar processos com detalhes:', error);
    res.status(500).json({ error: 'Erro ao buscar processos' });
  }
});

router.post('/processes', async (req, res) => {
  const {
    clientId,
    processNumber,
    title,
    status,
    startDate,
    lastUpdate,
    description,
    lawyer,
    situacaoPrisionalId,
    comarcaVaraId,
    tipoCrimeId
  } = req.body;

  try {
    const now = lastUpdate ? new Date(lastUpdate) : new Date();

    // Primeiro faz o INSERT usando nomes corretos das colunas
    const insertResult = await pool.query(
      `INSERT INTO process (
        clientid, processnumber, title, status, startdate, lastupdate,
        description, lawyer, situacaoprisionalid, comarcavaraid, tipocrimeid
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [
        clientId,
        processNumber,
        title,
        status,
        startDate,
        now,
        description,
        lawyer,
        situacaoPrisionalId,
        comarcaVaraId,
        tipoCrimeId
      ]
    );

    const processId = insertResult.rows[0].id;

    // Agora busca com JOINs o processo recém-inserido
    const result = await pool.query(`
      SELECT
        p.*,
        c.name AS client_name,
        sp.name AS situacao_prisional,
        cv.name AS comarca_vara,
        tc.name AS tipo_crime,
        '[]'::json AS updates
      FROM process p
      LEFT JOIN client c ON c.id = p.clientid
      LEFT JOIN situacaoprisional sp ON sp.id = p.situacaoprisionalid
      LEFT JOIN comarcavara cv ON cv.id = p.comarcavaraid
      LEFT JOIN tipocrime tc ON tc.id = p.tipocrimeid
      WHERE p.id = $1
      GROUP BY p.id, c.name, sp.name, cv.name, tc.name
    `, [processId]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao cadastrar processo:', error);
    res.status(500).json({ error: 'Erro ao cadastrar processo' });
  }
});

router.put('/processes/:id', async (req, res) => {
  const { id } = req.params;
  const {
    clientId,
    processNumber,
    title,
    status,
    startDate,
    lastUpdate,
    description,
    lawyer,
    situacaoPrisionalId,
    comarcaVaraId,
    tipoCrimeId
  } = req.body;

  try {
    const now = lastUpdate ? new Date(lastUpdate) : new Date();
    const result = await pool.query(
      `UPDATE process SET
        clientid = $1,
        processnumber = $2,
        title = $3,
        status = $4,
        startdate = $5,
        lastupdate = $6,
        description = $7,
        lawyer = $8,
        situacaoprisionalid = $9,
        comarcavaraid = $10,
        tipocrimeid = $11
      WHERE id = $12 RETURNING *`,
      [
        clientId,
        processNumber,
        title,
        status,
        startDate,
        now,
        description,
        lawyer,
        situacaoPrisionalId,
        comarcaVaraId,
        tipoCrimeId,
        id
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar processo:', error);
    res.status(500).json({ error: 'Erro ao atualizar processo' });
  }
});

router.delete('/processes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM process WHERE id = $1`, [id]);
    res.json({ message: 'Processo removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover processo:', error);
    res.status(500).json({ error: 'Erro ao remover processo' });
  }
});

// Tipos de Crime
router.get('/tiposCrime', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tipocrime');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar tipos de crime:', error);
    res.status(500).json({ error: 'Erro ao buscar tipos de crime' });
  }
});

router.post('/tiposCrime', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tipocrime (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar tipo de crime:', error);
    res.status(500).json({ error: 'Erro ao adicionar tipo de crime' });
  }
});
router.put('/tiposCrime/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tipocrime SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Tipo de crime não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar tipo de crime:', error);
    res.status(500).json({ error: 'Erro ao atualizar tipo de crime' });
  }
});
router.delete('/tiposCrime/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tipocrime WHERE id = $1', [id]);
    res.json({ message: 'Tipo de crime removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover tipo de crime:', error);
    res.status(500).json({ error: 'Erro ao remover tipo de crime' });
  }
});

// Comarcas/Varas
router.get('/comarcasVaras', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM comarcavara');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar comarcas/varas:', error);
    res.status(500).json({ error: 'Erro ao buscar comarcas/varas' });
  }
});

router.post('/comarcasVaras', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO comarcavara (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar comarca/vara:', error);
    res.status(500).json({ error: 'Erro ao adicionar comarca/vara' });
  }
});
router.put('/comarcasVaras/:id', async (req, res) => {
  const { id } = req.params;  
  const { name } = req.body;
  try { 
    const result = await pool.query(
      'UPDATE comarcavara SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Comarca/vara não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar comarca/vara:', error);
    res.status(500).json({ error: 'Erro ao atualizar comarca/vara' });
  } 
});
router.delete('/comarcasVaras/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM comarcavara WHERE id = $1', [id]);
    res.json({ message: 'Comarca/vara removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover comarca/vara:', error);
    res.status(500).json({ error: 'Erro ao remover comarca/vara' });
  }
});

// Situações Prisionais
router.get('/situacoesPrisionais', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM situacaoprisional');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar situações prisionais:', error);
    res.status(500).json({ error: 'Erro ao buscar situações prisionais' });
  }
});

router.post('/situacoesPrisionais', async (req, res) => {
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
});
router.put('/situacoesPrisionais/:id', async (req, res) => {
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
});
router.delete('/situacoesPrisionais/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM situacaoprisional WHERE id = $1', [id]);
    res.json({ message: 'Situação prisional removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover situação prisional:', error);
    res.status(500).json({ error: 'Erro ao remover situação prisional' });
  }
});

export default router;