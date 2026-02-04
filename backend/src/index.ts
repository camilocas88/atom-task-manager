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
  const allowedOrigins = [
    'http://localhost:4200',
    'https://atom-343c0.web.app',
    'https://atom-343c0.firebaseapp.com',
  ];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Permitir requests sin origin (como Postman) o desde orígenes permitidos
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  });

  logger.log('🚀 NestJS app configured for Firebase Functions');
  logger.log(
    `📡 CORS enabled for: ${process.env.FRONTEND_URL || 'all origins'}`,
  );

  return app;
};

// Inicializar la app (sin llamar a init() para evitar error de app.router deprecated)
createNestServer(server)
  .then(() => console.log('✅ Nest Ready for Firebase Functions'))
  .catch((err) => console.error('❌ Nest initialization error', err));

/**
 * Export como Firebase Function
 *
 * URL de producción: https://us-central1-atom-343c0.cloudfunctions.net/api
 */
export const api = functions.https.onRequest(server);
