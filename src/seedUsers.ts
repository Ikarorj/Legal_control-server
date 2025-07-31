import { pool } from './db';
import { kmsClient, PROJECT_ID, LOCATION_ID, KEY_RING_ID, KEY_ID, bcrypt } from './kms';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// 🔐 Função para montar o caminho da chave do KMS
function getKeyName(): string {
  return kmsClient.cryptoKeyPath(PROJECT_ID, LOCATION_ID, KEY_RING_ID, KEY_ID);
}

// 🔒 Criptografar com KMS
async function encrypt(text: string): Promise<string> {
  const [result] = await kmsClient.encrypt({
    name: getKeyName(),
    plaintext: Buffer.from(text),
  });
  return result.ciphertext.toString('base64');
}

// 🔑 Inserção dos usuários
async function insertEncryptedUsers() {
  const users = [
    {
      name: 'Dra. Maria Silva',
      email: 'maria@escritorio.com',
      cpf: '123.456.789-00',
      role: 'admin',
      password: 'admin123',
    },
    {
      name: 'João Santos',
      email: 'joao@escritorio.com',
      cpf: '987.654.321-00',
      role: 'employee',
      password: 'func123',
    },
    {
      name: 'Cláudia Almeida',
      email: 'claudia@escritorio.com',
      cpf: '321.123.456-78',
      role: 'employee',
      password: 'senha123',
    },
  ];

  for (const user of users) {
    // Calcula o hash SHA-256 do email (em minúsculo e trim para padronizar)
    const emailHash = crypto
      .createHash('sha256')
      .update(user.email.toLowerCase().trim())
      .digest('hex');

    const encryptedEmail = await encrypt(user.email);
    const encryptedCpf = await encrypt(user.cpf);
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await pool.query(
      `INSERT INTO "user" (name, email, cpf, role, password, email_hash, isActive, createdAt)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW())`,
      [user.name, encryptedEmail, encryptedCpf, user.role, hashedPassword, emailHash]
    );

    console.log(`✅ Usuário ${user.name} inserido com sucesso.`);
  }

  console.log('🏁 Todos os usuários foram inseridos.');
}

insertEncryptedUsers()
  .then(() => pool.end())
  .catch((err) => {
    console.error('Erro ao inserir usuários:', err);
    pool.end();
  });
