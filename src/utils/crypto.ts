import { InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

export function encrypt(
  text: string,
  secret: string,
): { iv: string; encryptedData: string; authTag: string } {
  const key = Buffer.from(secret, 'hex');
  if (key.length !== KEY_LENGTH) {
    throw new InternalServerErrorException(
      `Secret key must be ${KEY_LENGTH} bytes long, but got ${key.length} bytes`,
    );
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag,
  };
}

export function decrypt(
  encrypted: { iv: string; encryptedData: string; authTag: string },
  secret: string,
): string {
  if (secret.length !== KEY_LENGTH) {
    throw new Error(`Secret key must be ${KEY_LENGTH} bytes long`);
  }

  const iv = Buffer.from(encrypted.iv, 'hex');
  const key = Buffer.from(secret, 'utf-8');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));

  let decrypted = decipher.update(encrypted.encryptedData, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
}
