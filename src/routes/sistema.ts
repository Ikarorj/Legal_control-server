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

  // Pega tudo, mas ignora o id para o INSERT
  const { id, name, cpf, email, phone, accessKey, createdAt, updatedAt, createdBy } = req.body;

  try {
    const now = new Date();
    console.log({
  name, cpf, email, phone, accessKey, createdAt, updatedAt, createdBy
});

    const result = await pool.query(
      `INSERT INTO client (name, cpf, email, phone, accessKey, createdAt, updatedAt, createdBy)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, cpf, email, phone, accessKey, createdAt ?? now, updatedAt ?? now, createdBy]
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
  const { name, cpf, email, phone, accessKey, createdAt, updatedAt } = req.body;


  try {
    const now = new Date();

    // Pega accessKey e createdBy atuais do banco
    const currentResult = await pool.query('SELECT accesskey, createdby FROM client WHERE id = $1', [id]);
     const currentAccessKey = currentResult.rows[0].accesskey;
        const currentCreatedBy = currentResult.rows[0].createdby;

    
    const safeAccessKey = accessKey ?? currentAccessKey; // usa o atual se não veio no corpo
   const result = await pool.query(
  `UPDATE client SET
    name = $1,
    cpf = $2,
    email = $3,
    phone = $4,
    accessKey = $5,
    createdAt = $6,
    updatedAt = $7,
    createdBy = $8
  WHERE id = $9 RETURNING *`,
  [name, cpf, email, phone, safeAccessKey, createdAt ?? now, updatedAt ?? now, currentCreatedBy, id] // ✅ agora são 9 parâmetros
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
}   
);
   
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
}
);



// processUpdate
router.get('/processUpdate', async (req, res) => {
  try { 
    const result = await pool.query('SELECT * FROM processUpdate');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar atualizações de processos:', error);
    res.status(500).json({ error: 'Erro ao buscar atualizações de processos' });
  }
});

// Processos
router.get('/processes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,
        sp.nome AS situacao_prisional,
        cv.nome AS comarca_vara,
        tc.nome AS tipo_crime,
        COALESCE(json_agg(
          json_build_object(
            'id', pu.id,
            'description', pu.description,
            'author', pu.author,
            'date', pu.date
          )
        ) FILTER (WHERE pu.id IS NOT NULL), '[]') AS updates
      FROM process p
      LEFT JOIN situacaoprisional sp ON sp.id = p.situacaoprisionalid
      LEFT JOIN comarcavara cv ON cv.id = p.comarcavaraid
      LEFT JOIN tipocrime tc ON tc.id = p.tipocrimeid
      LEFT JOIN processupdate pu ON pu.processid = p.id
      GROUP BY p.id, sp.nome, cv.nome, tc.nome
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
    const result = await pool.query(
      `INSERT INTO process (
        clientId, processNumber, title, status, startDate, lastUpdate,
        description, lawyer, situacaoPrisionalId, comarcaVaraId, tipoCrimeId
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
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
        clientId = $1,
        processNumber = $2,
        title = $3,
        status = $4,
        startDate = $5,
        lastUpdate = $6,
        description = $7,
        lawyer = $8,
        situacaoPrisionalId = $9,
        comarcaVaraId = $10,
        tipoCrimeId = $11
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
    const result = await pool.query('SELECT * FROM tipoCrime');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar tipos de crime:', error);
    res.status(500).json({ error: 'Erro ao buscar tipos de crime' });
  }
});

// Comarcas/Varas
router.get('/comarcasVaras', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM comarcaVara');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar comarcas/varas:', error);
    res.status(500).json({ error: 'Erro ao buscar comarcas/varas' });
  }
});

// Situações Prisionais
router.get('/situacoesPrisionais', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM situacaoPrisional');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar situações prisionais:', error);
    res.status(500).json({ error: 'Erro ao buscar situações prisionais' });
  }
});

export default router;
