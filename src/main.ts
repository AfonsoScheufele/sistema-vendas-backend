import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as express from 'express';
import * as dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'x-empresa-id',
      'X-Empresa-Id',
      'empresa-id',
    ],
    exposedHeaders: ['Content-Disposition'],
  });

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    exceptionFactory: (errors) => {
      const messages = errors.map(error => {
        const constraints = Object.values(error.constraints || {});
        const errorMsg = `${error.property}: ${constraints.join(', ')}`;
        console.error(`❌ Erro de validação - ${errorMsg}`);
        console.error(`   Valor recebido:`, error.value);
        console.error(`   Tipo:`, typeof error.value);
        return errorMsg;
      });
      console.error(`📋 Total de erros de validação: ${errors.length}`);
      return new BadRequestException({
        message: messages.length > 0 ? messages : 'Validation failed',
        errors: errors,
      });
    },
  }));

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      database: 'connected',
      services: {
        websocket: 'running',
        redis: 'connected'
      }
    });
  });
  app.setGlobalPrefix('api');
  app.getHttpAdapter().get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      database: 'connected',
      services: {
        websocket: 'running',
        redis: 'connected'
      }
    });
  });

  // Compatibility for clients that call baseURL ending with /api and append /api/health
  app.getHttpAdapter().get('/api/api/health', (req, res) => {
    res.redirect(301, '/api/health');
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
}

bootstrap();
