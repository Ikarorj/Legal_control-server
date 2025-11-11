import { pool } from './db';
import { kmsClient, PROJECT_ID, LOCATION_ID, KEY_RING_ID, KEY_ID, bcrypt } from './kms';
import dotenv from 'dotenv';

dotenv.config();

// monta o caminho da chave do KMS
function getKeyName(): string {
  return kmsClient.cryptoKeyPath(PROJECT_ID, LOCATION_ID, KEY_RING_ID, KEY_ID);
}

// decifra email/CPF com KMS
async function decryptBase64(ciphertextBase64: string | null): Promise<string | null> {
  if (!ciphertextBase64) return null;
  const ciphertextBuffer = Buffer.from(ciphertextBase64, 'base64');
  const [result] = await kmsClient.decrypt({
    name: getKeyName(),
    ciphertext: ciphertextBuffer,
  });
  return result.plaintext.toString('utf8');
}

// lista todos os usuários decifrando email e cpf
async function listUsers() {
  const res = await pool.query(`SELECT id, name, email, cpf, role, isActive FROM "user" ORDER BY id`);
  return await Promise.all(
    res.rows.map(async (row) => {
      const email = await decryptBase64(row.email);
      const cpf = await decryptBase64(row.cpf);
      return { ...row, email, cpf };
    })
  );
}

// atualiza senha de um usuário pelo id
async function updateUserPassword(id: number, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await pool.query(`UPDATE "user" SET password = $1 WHERE id = $2`, [hashedPassword, id]);
}

// função principal para atualizar todas as senhas
async function updatePasswords() {
  const users = await listUsers();

  for (const user of users) {
    let newPassword = 'senhaaleatoria@123';
    if (user.name === 'Dra. Cristielle Medeiros') {
      newPassword = 'Novasenha@123';
    }

    await updateUserPassword(user.id, newPassword);
    console.log(`✅ Senha do usuário ${user.name} atualizada para "${newPassword}"`);
  }

  console.log('🏁 Todas as senhas foram atualizadas.');
}

// execução
(async () => {
  await updatePasswords();
  await pool.end();
})();
