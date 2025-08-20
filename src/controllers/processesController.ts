import { Request, Response } from 'express';
import { pool } from '../db';
import { encrypt, decrypt, crypto, bcrypt } from '../services/kmsService';

// 🔓 Descriptografar os campos sensíveis ao retornar dados
// 🔓 Descriptografar os campos sensíveis ao retornar dados
async function decryptProcessFields(process: any) {
  const decryptedUpdates = await Promise.all(
    (process.updates || []).map(async (update: any) => ({
      ...update,
      description: await decrypt(update.description),
      author: await decrypt(update.author),
    }))
  );

  return {
    ...process,
    processnumber: await decrypt(process.processnumber),
    title: await decrypt(process.title),
    description: await decrypt(process.description),
    lawyer: await decrypt(process.lawyer),
    updates: decryptedUpdates,
  };
}


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
    const decryptedRows = await Promise.all(rows.map(decryptProcessFields));

    res.json(decryptedRows);
  } catch  (error)  {
    console.error('Erro ao buscar processos:', error);
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
   const startDateValue = startdate
  ? startdate.split('T')[0] // garante YYYY-MM-DD
  : now.toISOString().split('T')[0];



     // 🔐 Criptografar campos sensíveis
    const encryptedProcessNumber = await encrypt(processNumber);
    const encryptedTitle = await encrypt(title);
    const encryptedDescription = await encrypt(description);
    const encryptedLawyer = await encrypt(lawyer);

    const { rows: [{ id: processId }] } = await pool.query(
      `INSERT INTO process (clientid, processnumber, title, status, startdate, lastupdate, description, lawyer, situacaoprisionalid, comarcavaraid, tipocrimeid)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [clientId, 
       encryptedProcessNumber,
       encryptedTitle, status,
       startDateValue, 
       now, 
       encryptedDescription, 
       encryptedLawyer, 
       situacaoPrisionalId, 
       comarcaVaraId, 
       tipoCrimeId]
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
    const decryptedProcess = await decryptProcessFields(rows[0]);

    res.status(201).json(decryptedProcess);

    
  } catch (error)  {
    console.error('Erro ao cadastrar processo:', error);
    res.status(500).json({ error: 'Erro ao cadastrar processo' });
  }
};

export const updateProcess = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    clientId,
    processNumber,
    title,
    status,
    startDate,
    description,
    lawyer,
    situacaoPrisionalId,
    comarcaVaraId,
    tipoCrimeId
  } = req.body;

  try {
    const now = new Date();

    // Monta arrays dinâmicos para query e valores
    const fields: string[] = [];
    const values: any[] = [];

    if (clientId !== undefined) fields.push(`clientid=$${fields.length + 1}`) && values.push(clientId);
    if (processNumber !== undefined) fields.push(`processnumber=$${fields.length + 1}`) && values.push(await encrypt(processNumber));
    if (title !== undefined) fields.push(`title=$${fields.length + 1}`) && values.push(await encrypt(title));
    if (status !== undefined) fields.push(`status=$${fields.length + 1}`) && values.push(status);
    if (startDate !== undefined) 
fields.push(`startdate=$${fields.length + 1}`) && values.push(startDate.split('T')[0]);


    if (description !== undefined) fields.push(`description=$${fields.length + 1}`) && values.push(await encrypt(description));
    if (lawyer !== undefined) fields.push(`lawyer=$${fields.length + 1}`) && values.push(await encrypt(lawyer));
    if (situacaoPrisionalId !== undefined) fields.push(`situacaoprisionalid=$${fields.length + 1}`) && values.push(situacaoPrisionalId);
    if (comarcaVaraId !== undefined) fields.push(`comarcavaraid=$${fields.length + 1}`) && values.push(comarcaVaraId);
    if (tipoCrimeId !== undefined) fields.push(`tipocrimeid=$${fields.length + 1}`) && values.push(tipoCrimeId);

    // Sempre atualiza a última modificação
    fields.push(`lastupdate=$${fields.length + 1}`);
    values.push(now);

    if (fields.length === 0) {
      res.status(400).json({ error: 'Nenhum campo fornecido para atualizar' });
      return;
    }

    values.push(id); // último valor é o id para o WHERE
    const { rows: updated } = await pool.query(
      `UPDATE process SET ${fields.join(', ')} WHERE id=$${fields.length + 1} RETURNING id`
      , values
    );

    if (updated.length === 0) {
      res.status(404).json({ error: 'Processo não encontrado' });
      return;
    }

    // Buscar o processo atualizado com JOINs
    const { rows } = await pool.query(`
      SELECT p.*, c.name AS client_name, sp.name AS situacao_prisional, cv.name AS comarca_vara, tc.name AS tipo_crime,
             COALESCE(
               json_agg(
                 json_build_object('id', pu.id, 'description', pu.description, 'author', pu.author, 'date', pu.date)
               ) FILTER (WHERE pu.id IS NOT NULL), '[]'
             ) AS updates
      FROM process p
      LEFT JOIN client c ON c.id = p.clientid
      LEFT JOIN situacaoprisional sp ON sp.id = p.situacaoprisionalid
      LEFT JOIN comarcavara cv ON cv.id = p.comarcavaraid
      LEFT JOIN tipocrime tc ON tc.id = p.tipocrimeid
      LEFT JOIN processupdate pu ON pu.processid = p.id
      WHERE p.id = $1
      GROUP BY p.id, c.name, sp.name, cv.name, tc.name
    `, [id]);

    const decryptedProcess = await decryptProcessFields(rows[0]);
    res.json(decryptedProcess);

  } catch (error: any) {
    console.error('Erro ao atualizar processo:', error);
    res.status(500).json({ error: 'Erro ao atualizar processo', details: error?.message || error });
  }
};



export const deleteProcess = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
     // Apaga as atualizações relacionadas ao processo
    await pool.query('DELETE FROM processUpdate WHERE processupdate.processid = $1', [id]);

    // Agora pode apagar o processo com segurança
    await pool.query('DELETE FROM process WHERE id = $1', [id]);
    res.json({ message: 'Processo removido com sucesso' });
  } catch (error)  {
    console.error('Erro ao remover processo:', error);
    res.status(500).json({ error: 'Erro ao remover processo' });
  }
};
