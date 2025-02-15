import { InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export function encrypt(text: string, secret: string): string {
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
  const authTag = cipher.getAuthTag();

  // Concatenate IV, authTag, and encrypted data into a single string (hex)
  return iv.toString('hex') + authTag.toString('hex') + encrypted;
}

export function decrypt(encryptedData: string, secret: string): string {
  if (secret.length !== KEY_LENGTH * 2) {
    throw new InternalServerErrorException(
      `Secret key must be ${KEY_LENGTH} bytes long`,
    );
  }

  const key = Buffer.from(secret, 'hex');
  const iv = Buffer.from(encryptedData.substring(0, IV_LENGTH * 2), 'hex');
  const authTag = Buffer.from(
    encryptedData.substring(IV_LENGTH * 2, IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2),
    'hex',
  );
  const encryptedText = encryptedData.substring(
    IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2,
  );

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
}
