import { Request, Response } from 'express';
import { pool } from '../db';
import { encrypt, decrypt } from '../services/kmsService';


async function decryptClientFields(client: any) {
  return {
    ...client,
    name: await decrypt(client.name),
    cpf: await decrypt(client.cpf),
    email: await decrypt(client.email),
    phone: await decrypt(client.phone),
    accesskey: await decrypt(client.accesskey),
  };
}


export const getAllClients = async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM client');
    const decryptedClients = await Promise.all(rows.map(decryptClientFields));
    res.json(decryptedClients);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
};


export const createClient = async (req: Request, res: Response) => {
  const { name, cpf, email, phone, accessKey, createdBy } = req.body;
  try {
    const now = new Date();

    const encryptedName = await encrypt(name);
    const encryptedCpf = await encrypt(cpf);
    const encryptedEmail = await encrypt(email);
    const encryptedPhone = await encrypt(phone);
    const encryptedAccessKey = await encrypt(accessKey);

    const { rows } = await pool.query(
      `INSERT INTO client (name, cpf, email, phone, accesskey, createdat, updatedat, createdby)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [encryptedName, encryptedCpf, encryptedEmail, encryptedPhone, encryptedAccessKey, now, now, createdBy || 1]
    );

    const decryptedClient = await decryptClientFields(rows[0]);
    res.status(201).json(decryptedClient);
  } catch {
    res.status(500).json({ error: 'Erro ao cadastrar cliente' });
  }
};


export const updateClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, cpf, email, phone, accessKey } = req.body;

  try {
    const now = new Date();
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name !== undefined) {
      fields.push(`name=$${idx++}`);
      values.push(await encrypt(name));
    }
    if (cpf !== undefined) {
      fields.push(`cpf=$${idx++}`);
      values.push(await encrypt(cpf));
    }
    if (email !== undefined) {
      fields.push(`email=$${idx++}`);
      values.push(await encrypt(email));
    }
    if (phone !== undefined) {
      fields.push(`phone=$${idx++}`);
      values.push(await encrypt(phone));
    }
    if (accessKey !== undefined) {
      fields.push(`accesskey=$${idx++}`);
      values.push(await encrypt(accessKey));
    }

    // sempre atualiza updatedat
    fields.push(`updatedat=$${idx++}`);
    values.push(now);

    // id no final
    values.push(id);

    const query = `
      UPDATE client 
      SET ${fields.join(', ')}
      WHERE id=$${idx}
      RETURNING *`;

    const { rows } = await pool.query(query, values);

    if (rows[0]) {
      const decryptedClient = await decryptClientFields(rows[0]);
      res.json(decryptedClient);
    } else {
      res.status(404).json({ error: 'Cliente não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
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