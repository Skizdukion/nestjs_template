import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { WinstonLoggerService } from 'src/logger/logger.service';

@Injectable()
export class CryptoService {
  private passphraseToKey: Map<string, Buffer> = new Map();

  constructor(
    private configService: ConfigService,
    private logger: WinstonLoggerService,
  ) {}

  async getDeriveKey(passphrase: string) {
    if (this.passphraseToKey.has(passphrase)) {
      return this.passphraseToKey.get(passphrase);
    }
    const key = await this.pbkdf2(passphrase);
    this.passphraseToKey.set(passphrase, key);
    return key;
  }

  pbkdf2(passphrase): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        passphrase,
        this.configService.get('crypto.salt'),
        1000,
        32,
        'sha256',
        (err, derivedKey) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(derivedKey);
          }
        },
      );
    });
  }

  public async encrypt(obj: any, passphrase: string) {
    try {
      const jsonString = JSON.stringify(obj);

      const iv = crypto.randomBytes(16);

      const key = await this.getDeriveKey(passphrase);

      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

      let encrypted = cipher.update(jsonString, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const combined = iv.toString('hex') + ':' + encrypted;

      return combined;
    } catch (e) {
      this.logger.error('Encypted failed', e);
    }
  }

  public async decrypt(combine: string, passphrase: string) {
    try {
      const [iv, encrypted] = combine.split(':');

      const key = await this.getDeriveKey(passphrase);

      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        key,
        Buffer.from(iv, 'hex'),
      );

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const json = JSON.parse(decrypted);

      return json;
    } catch (e) {
      this.logger.error('Decrypted failed', e);
    }
  }
}
