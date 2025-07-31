import { Request, Response } from 'express';
import { pool } from '../db';
import { kmsClient, PROJECT_ID, LOCATION_ID, KEY_RING_ID, KEY_ID, bcrypt } from '../kms';
import crypto from 'crypto';

function getKeyName(): string {
  return kmsClient.cryptoKeyPath(PROJECT_ID, LOCATION_ID, KEY_RING_ID, KEY_ID);
}

export async function encrypt(text: string): Promise<string> {
  const [result] = await kmsClient.encrypt({
    name: getKeyName(),
    plaintext: Buffer.from(text),
  });
  return result.ciphertext.toString('base64');
};
export async function decrypt(ciphertext: string): Promise<string> {
  const [result] = await kmsClient.decrypt({
    name: getKeyName(),
    ciphertext: Buffer.from(ciphertext, 'base64'),
  });
  return result.plaintext.toString();
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM "user" WHERE isActive = TRUE');

    const users = await Promise.all(result.rows.map(async (user) => ({
      ...user,
      email: await decrypt(user.email),
      cpf: await decrypt(user.cpf),
      password: undefined, // segurança: não enviar senha
    })));

    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};



export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');

    const result = await pool.query('SELECT * FROM "user" WHERE email_hash = $1', [emailHash]);

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
      return;
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const decryptedEmail = await decrypt(user.email);
    const decryptedCpf = await decrypt(user.cpf);

    res.json({
      id: user.id,
      name: user.name,
      email: decryptedEmail,
      cpf: decryptedCpf,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};