import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  HttpExceptionFilter,
  LoggingInterceptor,
  TransformInterceptor,
} from './shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

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

  // Configuración de CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  });

  const port = process.env.PORT ?? 3000;
  const environment = process.env.NODE_ENV || 'development';

  await app.listen(port);

  // Logs de inicio
  logger.log(`🚀 Backend ejecutándose en http://localhost:${port}`);
  logger.log(`🔐 Modo: ${environment}`);
  logger.log(
    `📡 CORS habilitado para: ${process.env.FRONTEND_URL || 'http://localhost:4200'}`,
  );
  logger.log('🛡️  Seguridad: JWT, Guards, Interceptors, Filters activados');
}

void bootstrap();
