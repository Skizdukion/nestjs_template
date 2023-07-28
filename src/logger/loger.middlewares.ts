import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from 'src/crypto/crypto.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {}

  use(req: any, res: any, next: (error?: any) => void) {
    const { method, params, query, body } = req;
    const startTime = Date.now();
    const userAgent = req.get('User-Agent') || '';

    const oldSend = res.send;
    let responseBody;

    res.send = function (data) {
      oldSend.apply(res, arguments);
      if (data) {
        responseBody = JSON.parse(data);
      }
    };

    res.on('finish', () => {
      const { statusCode } = res;
      const content = `${method} ${req.originalUrl} ${statusCode} - ${
        Date.now() - startTime
      }ms`;
      this.logger.log(content);
      this.logRequestDetail({
        url: req.originalUrl,
        userAgent,
        params,
        query,
        requestBody: body,
        responseBody,
        statusCode,
        executionTime: Date.now() - startTime + 'ms',
      });
    });

    next();
  }

  async logRequestDetail(req: {
    url: string;
    userAgent: string;
    params: any;
    query: any;
    requestBody: any;
    responseBody: any;
    statusCode: number;
    executionTime: any;
  }) {
    req.requestBody = await this.cryptoService.encrypt(
      req.requestBody,
      this.configService.get('logger.encryptPassphrase'),
    );
    this.logger.debug('Request Details', req);
  }
}
