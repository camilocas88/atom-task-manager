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

// Configuración CORS
const allowedOrigins = [
  'http://localhost:4200',
  'https://atom-343c0.web.app',
  'https://atom-343c0.firebaseapp.com',
];

let cachedServer: express.Express | null = null;

/**
 * Crea y configura la aplicación NestJS
 */
async function createServer(): Promise<express.Express> {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = express();
  
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

  // CORS
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  });

  // IMPORTANTE: Inicializar explícitamente para registrar rutas
  await app.init();

  cachedServer = expressApp;
  logger.log('🚀 NestJS app initialized');
  logger.log(`📡 CORS enabled for: ${allowedOrigins.join(', ')}`);

  return expressApp;
}

/**
 * Export como Firebase Function
 *
 * URL de producción: https://us-central1-atom-343c0.cloudfunctions.net/api
 */
export const api = functions.https.onRequest(async (req, res) => {
  try {
    const server = await createServer();
    server(req, res);
  } catch (error) {
    logger.error('Error handling request:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
