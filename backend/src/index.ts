
import { ExpressAdapter } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import * as functions from 'firebase-functions';
import { AppModule } from './app.module';
import {
  HttpExceptionFilter,
  LoggingInterceptor,
  TransformInterceptor,
} from './shared';

const server = express();

/**
 * Crea y configura la aplicación NestJS
 */
const createNestServer = async (expressInstance: express.Application) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
    {
      logger: ['error', 'warn', 'log'],
    },
  );

  const logger = new Logger('Firebase');

  // Validación global
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

  // Filtros e interceptores
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // CORS para producción
  app.enableCors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  });

  await app.init();

  logger.log('🚀 NestJS app initialized for Firebase Functions');
  logger.log(`📡 CORS enabled for: ${process.env.FRONTEND_URL || 'all origins'}`);

  return app;
};

// Inicializar la app
createNestServer(server)
  .then(() => console.log('✅ Nest Ready for Firebase Functions'))
  .catch((err) => console.error('❌ Nest broken', err));

/**
 * Export como Firebase Function
 * 
 * URL de producción: https://us-central1-atom-343c0.cloudfunctions.net/api
 */
export const api = functions.https.onRequest(server);
