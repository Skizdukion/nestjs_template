import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { WinstonLoggerService } from 'src/logger/logger.service';

@Module({
  imports: [],
  providers: [CryptoService, WinstonLoggerService],
  exports: [CryptoService],
})
export class CryptoModule {}
