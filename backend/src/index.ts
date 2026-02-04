import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as functions from 'firebase-functions';
import { Server } from 'http';
import { AppModule } from './app.module';
import {
  HttpExceptionFilter,
  LoggingInterceptor,
  TransformInterceptor,
} from './shared';

const logger = new Logger('Bootstrap');

const allowedOrigins = [
  'http://localhost:4200',
  'https://atom-343c0.web.app',
  'https://atom-343c0.firebaseapp.com',
];

let cachedServer: Server | null = null;

async function bootstrap(): Promise<Server> {
  if (cachedServer) {
    return cachedServer;
  }

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  });

  // CLAVE: Inicializar la app para registrar las rutas
  await app.init();
  
  // Obtener el servidor HTTP subyacente
  cachedServer = app.getHttpServer() as Server;
  
  logger.log('🚀 NestJS app ready');
  logger.log(`📡 CORS enabled for: ${allowedOrigins.join(', ')}`);

  return cachedServer;
}

export const api = functions.https.onRequest(async (req, res) => {
  const server = await bootstrap();
  server.emit('request', req, res);
});
