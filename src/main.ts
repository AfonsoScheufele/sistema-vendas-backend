import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Configuração de CORS mais permissiva
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Middleware para parsing JSON - ESSENCIAL para requisições POST
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.useGlobalFilters(new GlobalExceptionFilter());

  // Health check endpoint
  app.use('/api/health', (req, res) => {
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

  // Dashboard endpoints temporários
  app.use('/dashboard/test', (req, res) => {
    res.status(200).json({ message: 'Dashboard funcionando!' });
  });

  app.use('/dashboard/stats', (req, res) => {
    res.status(200).json({
      totalVendas: 0,
      clientesAtivos: 4,
      produtosEstoque: 5,
      pedidosPendentes: 0,
      faturamentoMes: 0,
      crescimentoVendas: 0,
      ticketMedio: 0,
      conversao: 0
    });
  });

  app.use('/dashboard/vendas-mensais', (req, res) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    res.status(200).json(meses.map((nome) => ({
      mes: nome,
      vendas: 0,
      pedidos: 0
    })));
  });

  app.use('/dashboard/produtos-mais-vendidos', (req, res) => {
    res.status(200).json([
      { produto: 'Notebook Dell Inspiron', quantidade: 0, faturamento: 0 },
      { produto: 'Mouse Logitech MX Master 3', quantidade: 0, faturamento: 0 },
      { produto: 'Teclado Mecânico Corsair K95', quantidade: 0, faturamento: 0 },
      { produto: 'Monitor Samsung 24"', quantidade: 0, faturamento: 0 },
      { produto: 'Smartphone Samsung Galaxy A54', quantidade: 0, faturamento: 0 }
    ]);
  });

  app.use('/dashboard/faturamento-diario', (req, res) => {
    res.status(200).json([
      { data: 'Dom', faturamento: 0 },
      { data: 'Seg', faturamento: 0 },
      { data: 'Ter', faturamento: 0 },
      { data: 'Qua', faturamento: 0 },
      { data: 'Qui', faturamento: 0 },
      { data: 'Sex', faturamento: 0 },
      { data: 'Sáb', faturamento: 0 }
    ]);
  });

  app.use('/dashboard/distribuicao-categorias', (req, res) => {
    res.status(200).json([
      { categoria: 'Informática', quantidade: 0, percentual: 0, faturamento: 0 },
      { categoria: 'Periféricos', quantidade: 0, percentual: 0, faturamento: 0 },
      { categoria: 'Monitores', quantidade: 0, percentual: 0, faturamento: 0 },
      { categoria: 'Smartphones', quantidade: 0, percentual: 0, faturamento: 0 }
    ]);
  });

  app.use('/dashboard/insights', (req, res) => {
    res.status(200).json({
      produtosBaixoEstoque: 0,
      crescimentoSemanal: 0,
      clienteTop: null,
      alertas: []
    });
  });

  // API Dashboard endpoints
  app.use('/api/dashboard/stats', (req, res) => {
    res.status(200).json({
      totalVendas: 0,
      clientesAtivos: 4,
      produtosEstoque: 5,
      pedidosPendentes: 0,
      faturamentoMes: 0,
      crescimentoVendas: 0,
      ticketMedio: 0,
      conversao: 0
    });
  });

  app.use('/api/dashboard/vendas-mensais', (req, res) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    res.status(200).json(meses.map((nome) => ({
      mes: nome,
      vendas: 0,
      pedidos: 0
    })));
  });

  app.use('/api/dashboard/produtos-mais-vendidos', (req, res) => {
    res.status(200).json([
      { produto: 'Notebook Dell Inspiron', quantidade: 0, faturamento: 0 },
      { produto: 'Mouse Logitech MX Master 3', quantidade: 0, faturamento: 0 },
      { produto: 'Teclado Mecânico Corsair K95', quantidade: 0, faturamento: 0 },
      { produto: 'Monitor Samsung 24"', quantidade: 0, faturamento: 0 },
      { produto: 'Smartphone Samsung Galaxy A54', quantidade: 0, faturamento: 0 }
    ]);
  });

  app.use('/api/dashboard/faturamento-diario', (req, res) => {
    res.status(200).json([
      { data: 'Dom', faturamento: 0 },
      { data: 'Seg', faturamento: 0 },
      { data: 'Ter', faturamento: 0 },
      { data: 'Qua', faturamento: 0 },
      { data: 'Qui', faturamento: 0 },
      { data: 'Sex', faturamento: 0 },
      { data: 'Sáb', faturamento: 0 }
    ]);
  });

  app.use('/api/dashboard/distribuicao-categorias', (req, res) => {
    res.status(200).json([
      { categoria: 'Informática', quantidade: 0, percentual: 0, faturamento: 0 },
      { categoria: 'Periféricos', quantidade: 0, percentual: 0, faturamento: 0 },
      { categoria: 'Monitores', quantidade: 0, percentual: 0, faturamento: 0 },
      { categoria: 'Smartphones', quantidade: 0, percentual: 0, faturamento: 0 }
    ]);
  });

  app.use('/api/dashboard/insights', (req, res) => {
    res.status(200).json({
      produtosBaixoEstoque: 0,
      crescimentoSemanal: 0,
      clienteTop: null,
      alertas: []
    });
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`🏥 Health check: http://localhost:${port}/api/health`);
}

bootstrap();
