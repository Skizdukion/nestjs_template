import { Module } from '@nestjs/common';
import { DbRepoService } from './db-repo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonLoggerService } from 'src/logger/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [DbRepoService, WinstonLoggerService],
  exports: [DbRepoService],
})
export class DbRepoModule {}
