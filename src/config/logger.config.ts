import { registerAs } from '@nestjs/config';

export default registerAs('logger', () => ({
  dirname: process.env.LOGGER_DIRNAME || 'server_log',
  rotate: process.env.LOGGER_DAILY_ROTATION || false,
  rotateDatePatttern: process.env.ROTATE_DATE_PATTERN || 'DD-MM-YY',
  prefix: process.env.LOGGER_FILE_PREFIX || '',
  timestampFormat: process.env.TIMESTAMP_FORMAT || 'YYYY-MM-DD HH:mm:ss',
  consoleLevel: process.env.CONSOLE_LOG_LEVEL || 'info',
  encryptPassphrase: process.env.LOGGER_ENCRYPTION_PASSPHRASE || '123',
  fileFlagsOpenOptions: process.env.LOGGER_FILE_FLAGS || 'w',
}));
