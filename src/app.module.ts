import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import cryptoConfig from './config/crypto.config';
import loggerConfig from './config/logger.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { DataSource } from 'typeorm';
import { WinstonLoggerService } from './logger/logger.service';
import { LoggerMiddleware } from './logger/loger.middlewares';
import { CryptoModule } from './crypto/crypto.module';
import { DbRepoModule } from './db-repo/db-repo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, loggerConfig, cryptoConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
    CryptoModule,
    DbRepoModule,
  ],
  providers: [
    {
      provide: Logger,
      useFactory: (configService: ConfigService) => {
        return new WinstonLoggerService(configService);
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
