import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication } from '@nestjs/common';
import express from 'express';
import cors from 'cors';
import * as functions from 'firebase-functions';
import { AppModule } from './app.module';
import {
  HttpExceptionFilter,
  LoggingInterceptor,
  TransformInterceptor,
} from './shared';

const logger = new Logger('Bootstrap');
const server = express();

// Configurar CORS en Express ANTES de NestJS
const allowedOrigins = [
  'http://localhost:4200',
  'https://atom-343c0.web.app',
  'https://atom-343c0.firebaseapp.com',
];

server.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

let cachedApp: INestApplication | null = null;

/**
 * Crea y configura la aplicación NestJS
 */
async function createNestApp(): Promise<INestApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
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

  cachedApp = app;
  logger.log('🚀 NestJS app initialized');
  logger.log(`📡 CORS enabled for: ${allowedOrigins.join(', ')}`);

  return app;
}

/**
 * Export como Firebase Function
 *
 * URL de producción: https://us-central1-atom-343c0.cloudfunctions.net/api
 */
export const api = functions.https.onRequest(async (req, res) => {
  try {
    await createNestApp();
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
