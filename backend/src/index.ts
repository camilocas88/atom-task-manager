import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import * as functions from 'firebase-functions';
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

const expressApp = express();
let isBootstrapped = false;

async function bootstrap(): Promise<void> {
  if (isBootstrapped) {
    return;
  }

  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter, {
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

  // NO llamar app.init() - Se inicializa automáticamente en el primer request
  isBootstrapped = true;
  logger.log('🚀 NestJS app ready');
  logger.log(`📡 CORS enabled for: ${allowedOrigins.join(', ')}`);
}

export const api = functions.https.onRequest(async (req, res) => {
  await bootstrap();
  expressApp(req, res);
});
