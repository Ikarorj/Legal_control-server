// src/services/kmsService.ts

import {
  kmsClient,
  PROJECT_ID,
  LOCATION_ID,
  KEY_RING_ID,
  KEY_ID,
  bcrypt,
} from '../kms';
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
}

export async function decrypt(ciphertext: string): Promise<string> {
  const [result] = await kmsClient.decrypt({
    name: getKeyName(),
    ciphertext: Buffer.from(ciphertext, 'base64'),
  });
  return result.plaintext.toString();
}

export { crypto, bcrypt };
