import { registerAs } from '@nestjs/config';

export default registerAs('crypto', () => ({
  salt: process.env.ENCRYPTED_SALT || 'server_salt',
}));
