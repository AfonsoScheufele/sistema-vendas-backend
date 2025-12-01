import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as express from 'express';
import * as dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

type RateBucket = { count: number; resetAt: number };
const rateBuckets: Record<string, RateBucket> = {};
const WINDOW_MS = 60 * 1000; // 1 min
const MAX_REQ_PER_WINDOW = parseInt(process.env.RATE_LIMIT_PER_MIN || '120', 10);

function rateLimitMiddleware(req: any, res: any, next: any) {
  const ip = (req.ip || req.connection?.remoteAddress || 'unknown').toString();
  const now = Date.now();
  const bucket = rateBuckets[ip] || { count: 0, resetAt: now + WINDOW_MS };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + WINDOW_MS;
  }
  bucket.count += 1;
  rateBuckets[ip] = bucket;
  res.setHeader('X-RateLimit-Limit', String(MAX_REQ_PER_WINDOW));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, MAX_REQ_PER_WINDOW - bucket.count)));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
  if (bucket.count > MAX_REQ_PER_WINDOW) {
    return res.status(429).json({ message: 'Too many requests' });
  }
  next();
}

function securityHeadersMiddleware(req: any, res: any, next: any) {
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Referrer-Policy', 'no-referrer');
  const csp = process.env.CSP_DEFAULT_SRC || "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:";
  res.setHeader('Content-Security-Policy', csp);
  next();
}

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
      'Empresa-Id',
      'empresa',
      'Empresa',
    ],
    exposedHeaders: ['Content-Disposition'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(securityHeadersMiddleware);
  app.use(rateLimitMiddleware);

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

  app.getHttpAdapter().get('/api/api/health', (req, res) => {
    res.redirect(301, '/api/health');
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
}

bootstrap();
