import { Injectable, Logger } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';
import util from 'util';

@Injectable()
export class WinstonLoggerService extends Logger {
  private static winstonLogger: winston.Logger;

  createWinstonModuleOptions() {
    if (this.configService.get('logger.dirname') == undefined) {
      return;
    }

    let _transport;

    if (this.configService.get('logger.rotate') == true) {
      _transport = [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.simple(),
          ),
          level: this.configService.get('logger.consoleLevel'),
        }),
        new winston.transports.DailyRotateFile({
          dirname: this.configService.get('logger.dirname') + '/%DATE%',
          filename: `${this.configService.get('logger.prefix')}info.log`,
          datePattern: this.configService.get('logger.rotateDatePatttern'),
          format: winston.format.simple(),
          options: {
            flags: this.configService.get('logger.fileFlagsOpenOptions'),
          },
        }),

        new winston.transports.DailyRotateFile({
          dirname: this.configService.get('logger.dirname') + '/%DATE%',
          filename: `${this.configService.get('logger.prefix')}debug.log`,
          datePattern: this.configService.get('logger.rotateDatePatttern'),
          format: winston.format.simple(),
          level: 'debug',
          options: {
            flags: this.configService.get('logger.fileFlagsOpenOptions'),
          },
        }),

        new winston.transports.DailyRotateFile({
          dirname: this.configService.get('logger.dirname') + '/%DATE%',
          filename: `${this.configService.get('logger.prefix')}error.log`,
          datePattern: this.configService.get('logger.rotateDatePatttern'),
          format: winston.format.simple(),
          level: 'error',
          options: {
            flags: this.configService.get('logger.fileFlagsOpenOptions'),
          },
        }),
      ];
    } else {
      _transport = [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.simple(),
          ),
          level: this.configService.get('logger.consoleLevel'),
        }),

        new winston.transports.File({
          dirname: this.configService.get('logger.dirname'),
          filename: `${this.configService.get('logger.prefix')}info.log`,
          format: winston.format.simple(),
          options: {
            flags: this.configService.get('logger.fileFlagsOpenOptions'),
          },
        }),

        new winston.transports.File({
          dirname: this.configService.get('logger.dirname'),
          filename: `${this.configService.get('logger.prefix')}debug.log`,
          format: winston.format.simple(),
          level: 'debug',
          options: {
            flags: this.configService.get('logger.fileFlagsOpenOptions'),
          },
        }),

        new winston.transports.File({
          dirname: this.configService.get('logger.dirname'),
          filename: `${this.configService.get('logger.prefix')}error.log`,
          format: winston.format.simple(),
          level: 'error',
          options: {
            flags: this.configService.get('logger.fileFlagsOpenOptions'),
          },
        }),
      ];
    }

    return {
      format: winston.format.combine(
        winston.format.timestamp({
          format: this.configService.get('logger.timestampFormat'),
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
      ),
      transports: _transport,
    };
  }

  constructor(private configService: ConfigService) {
    super();
    if (!WinstonLoggerService.winstonLogger) {
      WinstonLoggerService.winstonLogger = winston.createLogger(
        this.createWinstonModuleOptions(),
      );
      this.log('Initiate new winston instance');
    }
  }

  log(message: string, optionalParams?: any) {
    WinstonLoggerService.winstonLogger.info(message);
    if (optionalParams) {
      WinstonLoggerService.winstonLogger.info(
        util.inspect(optionalParams, false, null, false),
      );
    }
  }

  error(message: string, trace: string) {
    WinstonLoggerService.winstonLogger.error(message, trace);
  }

  warn(message: string, optionalParams?: any) {
    WinstonLoggerService.winstonLogger.warn(message, optionalParams);
    if (optionalParams) {
      WinstonLoggerService.winstonLogger.warn(
        util.inspect(optionalParams, false, null, false),
      );
    }
  }

  debug(message: string, optionalParams?: any) {
    WinstonLoggerService.winstonLogger.debug(message);
    if (optionalParams) {
      WinstonLoggerService.winstonLogger.debug(
        util.inspect(optionalParams, false, null, false),
      );
    }
  }

  verbose(message: string, optionalParams?: any) {
    WinstonLoggerService.winstonLogger.verbose(message);
    if (optionalParams) {
      WinstonLoggerService.winstonLogger.verbose(
        util.inspect(optionalParams, false, null, false),
      );
    }
  }
}
