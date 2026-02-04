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
const expressApp = express();
let isAppInitialized = false;

/**
 * Crea y configura la aplicación NestJS
 */
async function bootstrap(): Promise<void> {
  if (isAppInitialized) {
    return;
  }

  try {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        logger: ['error', 'warn', 'log'],
      },
    );

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

    // Inicializar la aplicación
    await app.init();

    isAppInitialized = true;
    logger.log('🚀 NestJS app initialized successfully');
    logger.log(`📡 CORS enabled for: ${allowedOrigins.join(', ')}`);
  } catch (error) {
    logger.error('❌ Failed to initialize NestJS app', error);
    throw error;
  }
}

/**
 * Export como Firebase Function
 *
 * URL de producción: https://us-central1-atom-343c0.cloudfunctions.net/api
 */
export const api = functions.https.onRequest(async (req, res) => {
  await bootstrap();
  expressApp(req, res);
});
