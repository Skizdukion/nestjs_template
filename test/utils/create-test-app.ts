import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import { AppModule } from 'src/app.module';
import validationOptions from 'src/utils/validation-options';
import net, { AddressInfo } from 'net';
export default class TestApp {
  static async createNewApp() {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleRef.createNestApplication({ cors: true });

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    const configService = app.get(ConfigService);

    app.enableShutdownHooks();
    app.setGlobalPrefix(configService.get('app.apiPrefix'), {
      exclude: ['/'],
    });
    app.enableVersioning({
      type: VersioningType.URI,
    });
    app.useGlobalPipes(new ValidationPipe(validationOptions));
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    let randomFreePort: number;
    do {
      try {
        randomFreePort = await getRandomFreePort();
      } catch (e) {}
    } while (!randomFreePort);

    const url = `http://localhost:${randomFreePort}`;

    await app.listen(randomFreePort);
    return {
      app,
      url,
    };
  }
}

function getRandomFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, () => {
      const port = (server.address() as AddressInfo).port;
      server.close(() => {
        if (port) {
          resolve(port);
        } else {
          reject(new Error('Failed to get a valid port number.'));
        }
      });
    });
  });
}
